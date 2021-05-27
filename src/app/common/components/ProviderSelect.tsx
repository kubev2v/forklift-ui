import * as React from 'react';
import { useClusterProvidersQuery, useInventoryProvidersQuery } from '@app/queries';
import {
  InventoryProvider,
  IOpenShiftProvider,
  IProviderObject,
  SourceInventoryProvider,
} from '@app/queries/types';
import { getFormGroupProps, IValidatedFormField } from '@konveyor/lib-ui';
import {
  Divider,
  FormGroup,
  Select,
  SelectGroup,
  SelectOption,
  SelectProps,
} from '@patternfly/react-core';
import {
  PlanStatusType,
  ProviderType,
  PROVIDER_TYPE_NAMES,
  SOURCE_PROVIDER_TYPES,
  TARGET_PROVIDER_TYPES,
} from '../constants';
import { getAvailableProviderTypes, hasCondition } from '../helpers';
import ConditionalTooltip from './ConditionalTooltip';
import { QuerySpinnerMode, ResolvedQueries } from './ResolvedQuery';

import { isSameResource } from '@app/queries/helpers';
import { OptionWithValue } from './SimpleSelect';

interface IProviderSelectBaseProps<T> extends Partial<SelectProps> {
  notReadyTooltipPosition?: 'left' | 'right';
  field: IValidatedFormField<T | null>;
}

interface ISourceProviderSelectProps extends IProviderSelectBaseProps<SourceInventoryProvider> {
  providerRole: 'source';
}

interface ITargetProviderSelectProps extends IProviderSelectBaseProps<IOpenShiftProvider> {
  providerRole: 'target';
}

type ProviderSelectProps = ISourceProviderSelectProps | ITargetProviderSelectProps;

const ProviderSelect: React.FunctionComponent<ProviderSelectProps> = ({
  providerRole,
  field,
  notReadyTooltipPosition = 'left',
  ...props
}: ProviderSelectProps) => {
  const inventoryProvidersQuery = useInventoryProvidersQuery();
  const clusterProvidersQuery = useClusterProvidersQuery();
  const { data: inventoryData } = inventoryProvidersQuery;

  const getMatchingInventoryProvider = (clusterProvider: IProviderObject) => {
    const providers: InventoryProvider[] =
      (inventoryData && inventoryData[clusterProvider.spec.type || '']) || [];
    if (providers) {
      return providers.find((provider) => isSameResource(provider, clusterProvider.metadata));
    }
    return null;
  };

  const availableProviderTypes = getAvailableProviderTypes(clusterProvidersQuery).filter((type) =>
    (providerRole === 'source' ? SOURCE_PROVIDER_TYPES : TARGET_PROVIDER_TYPES).includes(type)
  );
  // TODO handle the empty case here, "no source/target providers available" or something

  const optionNodesByType: Partial<Record<ProviderType, React.ReactElement[]>> = {};
  const optionObjectsByUid: Record<string, OptionWithValue<IProviderObject>> = {};
  availableProviderTypes.forEach((type) => {
    const clusterProviders =
      clusterProvidersQuery.data?.items.filter((provider) => provider.spec.type === type) || [];
    optionNodesByType[type] = clusterProviders.map((clusterProvider) => {
      const inventoryProvider = getMatchingInventoryProvider(clusterProvider);
      const isReady =
        !!inventoryProvider &&
        hasCondition(clusterProvider.status?.conditions || [], PlanStatusType.Ready);
      const optionObject: OptionWithValue<IProviderObject> = {
        toString: () => clusterProvider.metadata.name,
        value: clusterProvider,
      };
      const option = (
        <SelectOption
          key={clusterProvider.metadata.name}
          value={optionObject}
          isDisabled={!isReady}
          className={!isReady ? 'disabled-with-pointer-events' : ''}
        >
          <ConditionalTooltip
            isTooltipEnabled={!isReady}
            content="This provider cannot be selected because its inventory data is not ready"
            position={notReadyTooltipPosition}
          >
            <div>{clusterProvider.metadata.name}</div>
          </ConditionalTooltip>
        </SelectOption>
      );
      if (clusterProvider.metadata.uid) {
        optionObjectsByUid[clusterProvider.metadata.uid || ''] = optionObject;
      }
      return option;
    });
  });

  const selectedProvider = (clusterProvidersQuery.data?.items || []).find(
    (provider) => provider.metadata.uid === field.value?.uid
  );

  const [isOpen, setIsOpen] = React.useState(false);

  const label = providerRole === 'source' ? 'Source provider' : 'Target provider';

  return (
    <ResolvedQueries
      results={[inventoryProvidersQuery, clusterProvidersQuery]}
      errorTitles={[
        'Error loading provider inventory data',
        'Error loading providers from cluster',
      ]}
      spinnerMode={QuerySpinnerMode.Inline}
    >
      <FormGroup
        label={label}
        isRequired
        fieldId={`provider-select-${providerRole}`}
        {...getFormGroupProps(field as IValidatedFormField<unknown>)}
      >
        <Select
          id={`provider-select-${providerRole}`}
          toggleId={`provider-select-${providerRole}-toggle`}
          aria-label={label}
          placeholderText="Select a provider..."
          isOpen={isOpen}
          onToggle={setIsOpen}
          selections={
            selectedProvider?.metadata.uid
              ? [optionObjectsByUid[selectedProvider.metadata.uid]]
              : []
          }
          onSelect={(_event, selection) => {
            setIsOpen(false);
            const matchingInventoryProvider = getMatchingInventoryProvider(
              (selection as OptionWithValue<IProviderObject>).value
            );
            if (matchingInventoryProvider) {
              // There's probably some better way to make TS happy here.
              // The discriminated union of ProviderSelectProps should mean that providerRole === 'source'
              // narrows the type of `field` to IValidatedFormField<SourceInventoryProvider | null>, for example.
              if (providerRole === 'source') {
                (field as IValidatedFormField<SourceInventoryProvider | null>).setValue(
                  matchingInventoryProvider as SourceInventoryProvider
                );
              } else {
                (field as IValidatedFormField<IOpenShiftProvider | null>).setValue(
                  matchingInventoryProvider as IOpenShiftProvider
                );
              }
            }
          }}
          {...props}
        >
          {availableProviderTypes.length === 1
            ? optionNodesByType[availableProviderTypes[0]] || []
            : availableProviderTypes.map((type, index) => (
                <>
                  <SelectGroup key={type} label={PROVIDER_TYPE_NAMES[type]}>
                    {optionNodesByType[type]}
                  </SelectGroup>
                  {index !== availableProviderTypes.length - 1 ? <Divider key="divider" /> : null}
                </>
              ))}
        </Select>
      </FormGroup>
    </ResolvedQueries>
  );
};

export default ProviderSelect;
