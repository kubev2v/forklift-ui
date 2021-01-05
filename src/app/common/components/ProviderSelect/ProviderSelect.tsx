import * as React from 'react';
import { useClusterProvidersQuery, useInventoryProvidersQuery } from '@app/queries';
import { InventoryProvider, IProviderObject } from '@app/queries/types';
import { getFormGroupProps, IValidatedFormField } from '@konveyor/lib-ui';
import { FormGroup } from '@patternfly/react-core';
import { PlanStatusType, ProviderType } from '../../constants';
import { hasCondition } from '../../helpers';
import ConditionalTooltip from '../ConditionalTooltip';
import { QuerySpinnerMode, ResolvedQueries } from '../ResolvedQuery';
import SimpleSelect, { OptionWithValue } from '../SimpleSelect';

import './ProviderSelect.css';

interface IProviderSelectProps<T extends InventoryProvider> {
  label: string;
  providerType: ProviderType;
  field: IValidatedFormField<T | null>;
  notReadyTooltipPosition?: 'left' | 'right';
}

const ProviderSelect = <T extends InventoryProvider>({
  label,
  providerType,
  field,
  notReadyTooltipPosition = 'left',
}: React.PropsWithChildren<IProviderSelectProps<T>>): JSX.Element | null => {
  const inventoryProvidersQuery = useInventoryProvidersQuery();
  const clusterProvidersQuery = useClusterProvidersQuery();
  const { data: inventoryData } = inventoryProvidersQuery;
  const inventoryProviders = ((inventoryData && inventoryData[providerType]) || []) as T[];
  const clusterProviders =
    clusterProvidersQuery.data?.items.filter((provider) => provider.spec.type === providerType) ||
    [];

  const getMatchingInventoryProvider = (clusterProvider: IProviderObject) =>
    inventoryProviders.find((provider) => provider.name === clusterProvider.metadata.name);

  const options = Object.values(clusterProviders).map((provider) => {
    const inventoryProvider = getMatchingInventoryProvider(provider);
    const isReady =
      !!inventoryProvider && hasCondition(provider.status?.conditions || [], PlanStatusType.Ready);
    return {
      toString: () => provider.metadata.name,
      value: provider,
      props: {
        isDisabled: !isReady,
        className: !isReady ? 'disabled-with-pointer-events' : '',
        children: (
          <ConditionalTooltip
            isTooltipEnabled={!isReady}
            content="This provider cannot be selected because its inventory data is not ready"
            position={notReadyTooltipPosition}
            distance={28}
          >
            <div>{provider.metadata.name}</div>
          </ConditionalTooltip>
        ),
      },
    } as OptionWithValue<IProviderObject>;
  });

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
        fieldId={`provider-select-${providerType}`}
        {...getFormGroupProps(field)}
      >
        <SimpleSelect
          id={`provider-select-${providerType}`}
          aria-label={label}
          options={options}
          value={[options.find((option) => option.value.metadata.name === field.value?.name)]}
          onChange={(selection) => {
            const matchingInventoryProvider = inventoryProviders.find(
              (provider) =>
                provider.name ===
                (selection as OptionWithValue<IProviderObject>).value.metadata.name
            );
            if (matchingInventoryProvider) {
              field.setValue(matchingInventoryProvider);
            }
          }}
          placeholderText="Select a provider..."
        />
      </FormGroup>
    </ResolvedQueries>
  );
};

export default ProviderSelect;
