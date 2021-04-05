import * as React from 'react';
import {
  SelectGroup,
  SelectOption,
  FormGroup,
  Select,
  TextContent,
  Text,
  Popover,
  Button,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { getFormGroupProps } from '@konveyor/lib-ui';

import { ResolvedQueries, QuerySpinnerMode } from '@app/common/components/ResolvedQuery';
import { useNamespacesQuery } from '@app/queries/namespaces';
import { useOpenShiftNetworksQuery } from '@app/queries/networks';
import { POD_NETWORK } from '@app/queries/types';
import { PlanWizardFormState } from './PlanWizard';
import SelectOpenShiftNetworkModal from '@app/common/components/SelectOpenShiftNetworkModal';

interface ITargetNamespaceAndNetworkSelectProps {
  form: PlanWizardFormState['general'];
}

const TargetNamespaceAndNetworkSelect: React.FunctionComponent<ITargetNamespaceAndNetworkSelectProps> = ({
  form,
}: ITargetNamespaceAndNetworkSelectProps) => {
  const namespacesQuery = useNamespacesQuery(form.values.targetProvider);
  const openshiftNetworksQuery = useOpenShiftNetworksQuery(form.values.targetProvider);

  const [isNamespaceSelectOpen, setIsNamespaceSelectOpen] = React.useState(false);
  const [isSelectNetworkModalOpen, toggleSelectNetworkModal] = React.useReducer(
    (isOpen) => !isOpen,
    false
  );
  const [typeaheadValue, setTypeaheadValue] = React.useState('');

  const getFilteredOptions = (searchText?: string) => {
    const namespaceOptions = namespacesQuery.data?.map((namespace) => namespace.name) || [];
    const filteredNamespaces = !searchText
      ? namespaceOptions
      : namespaceOptions.filter((option) => {
          try {
            return !!option.toLowerCase().match(searchText.toLowerCase());
          } catch (e) {
            return false;
          }
        });
    return [
      <SelectGroup key="group" label="Select or type to create a namespace">
        {filteredNamespaces.map((option) => (
          <SelectOption key={option.toString()} value={option} />
        ))}
      </SelectGroup>,
    ];
  };

  const onTargetNamespaceChange = (targetNamespace: string) => {
    if (targetNamespace !== form.values.targetNamespace) {
      const providerDefaultNetworkName =
        form.values.targetProvider?.object.metadata.annotations?.[
          'forklift.konveyor.io/defaultTransferNetwork'
        ] || null;
      const matchingNetwork = openshiftNetworksQuery.data?.find(
        (network) =>
          network.name === providerDefaultNetworkName && network.namespace === targetNamespace
      );
      form.fields.migrationNetwork.setInitialValue(matchingNetwork?.name || null);
    }
  };

  // TODO validation errors are not showing up?
  // TODO why do we need the value to be updated in form state for the "Create" option to not be one render behind?

  return (
    <FormGroup
      label="Target namespace"
      isRequired
      fieldId="target-namespace"
      {...getFormGroupProps(form.fields.targetNamespace)}
    >
      <ResolvedQueries
        results={[namespacesQuery, openshiftNetworksQuery]}
        errorTitles={['Error loading namespaces', 'Error loading networks']}
        spinnerProps={{ className: spacing.mXs }}
        spinnerMode={QuerySpinnerMode.Inline}
      >
        <Select
          placeholderText="Select a namespace"
          isOpen={isNamespaceSelectOpen}
          onToggle={setIsNamespaceSelectOpen}
          onSelect={(_event, selection) => {
            form.fields.targetNamespace.setValue(selection as string);
            setIsNamespaceSelectOpen(false);
            onTargetNamespaceChange(selection as string);
            setTypeaheadValue('');
          }}
          onTypeaheadInputChanged={(value) => {
            setTypeaheadValue(value);
            form.fields.targetNamespace.setValue(value);
            onTargetNamespaceChange(value);
          }}
          onFilter={(event) => getFilteredOptions(event?.target.value || typeaheadValue)}
          selections={form.values.targetNamespace}
          variant="typeahead"
          isCreatable
          isGrouped
          id="target-namespace"
          aria-label="Target namespace"
          isDisabled={!form.values.targetProvider || !openshiftNetworksQuery.data}
        >
          {getFilteredOptions()}
        </Select>
        {form.values.targetNamespace ? (
          <>
            <TextContent className={spacing.mtMd}>
              <Text component="p">
                The migration transfer network for this migration plan is:{' '}
                <strong>{form.values.migrationNetwork || POD_NETWORK.name}</strong>.
                <Popover bodyContent="The default migration network defined for the OpenShift Virtualization provider is used if it exists in the target namespace. Otherwise, the pod network is used. You can select a different network for this migration plan.">
                  <button
                    aria-label="More info for migration transfer network field"
                    onClick={(e) => e.preventDefault()}
                    className="pf-c-form__group-label-help"
                  >
                    <HelpIcon noVerticalAlign />
                  </button>
                </Popover>
              </Text>
            </TextContent>
            <Button
              variant="link"
              isInline
              onClick={toggleSelectNetworkModal}
              className={spacing.mtXs}
            >
              Select a different network
            </Button>
          </>
        ) : null}
      </ResolvedQueries>
      {isSelectNetworkModalOpen ? (
        <SelectOpenShiftNetworkModal
          targetProvider={form.values.targetProvider}
          targetNamespace={form.values.targetNamespace}
          initialSelectedNetwork={form.values.migrationNetwork}
          instructions="Select the network that will be used for migrating data to the namespace."
          onClose={toggleSelectNetworkModal}
          onSubmit={(network) => {
            form.fields.migrationNetwork.setValue(network?.name || null);
            toggleSelectNetworkModal();
          }}
        />
      ) : null}
    </FormGroup>
  );
};

export default TargetNamespaceAndNetworkSelect;
