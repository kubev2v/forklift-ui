import * as React from 'react';
import {
  Form,
  FormGroup,
  Select,
  SelectGroup,
  SelectOption,
  TextArea,
  Title,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { getFormGroupProps, ValidatedTextInput } from '@konveyor/lib-ui';

import { IPlan } from '@app/queries/types';
import { useClusterProvidersQuery, useInventoryProvidersQuery } from '@app/queries';
import { PlanWizardFormState } from './PlanWizard';
import { useNamespacesQuery } from '@app/queries/namespaces';
import {
  QuerySpinnerMode,
  ResolvedQueries,
  ResolvedQuery,
} from '@app/common/components/ResolvedQuery';
import ProviderSelect from '@app/common/components/ProviderSelect';
import { ProviderType } from '@app/common/constants';

interface IGeneralFormProps {
  form: PlanWizardFormState['general'];
  planBeingEdited: IPlan | null;
}

const GeneralForm: React.FunctionComponent<IGeneralFormProps> = ({
  form,
  planBeingEdited,
}: IGeneralFormProps) => {
  const inventoryProvidersQuery = useInventoryProvidersQuery();
  const clusterProvidersQuery = useClusterProvidersQuery();
  const namespacesQuery = useNamespacesQuery(form.values.targetProvider);

  const [isNamespaceSelectOpen, setIsNamespaceSelectOpen] = React.useState(false);
  const namespaceOptions = namespacesQuery.data?.map((namespace) => namespace.name) || [];

  return (
    <ResolvedQueries
      results={[inventoryProvidersQuery, clusterProvidersQuery]}
      errorTitles={[
        'Error loading provider inventory data',
        'Error loading providers from cluster',
      ]}
    >
      <Form className={spacing.pbXl}>
        <Title headingLevel="h2" size="md">
          Give your plan a name and a description
        </Title>
        <ValidatedTextInput
          field={form.fields.planName}
          label="Plan name"
          isRequired
          fieldId="plan-name"
          inputProps={{ isDisabled: !!planBeingEdited }}
        />
        <ValidatedTextInput
          component={TextArea}
          field={form.fields.planDescription}
          label="Plan description"
          fieldId="plan-description"
        />
        <Title headingLevel="h3" size="md">
          Select source and target providers
        </Title>
        <ProviderSelect
          label="Source provider"
          providerType={ProviderType.vsphere}
          field={form.fields.sourceProvider}
        />
        <ProviderSelect
          label="Target provider"
          providerType={ProviderType.openshift}
          field={form.fields.targetProvider}
        />
        <FormGroup
          label="Target namespace"
          isRequired
          fieldId="target-namespace"
          {...getFormGroupProps(form.fields.targetNamespace)}
        >
          <ResolvedQuery
            result={namespacesQuery}
            errorTitle="Error loading namespaces"
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
              }}
              selections={form.values.targetNamespace}
              variant="typeahead"
              isCreatable
              isGrouped
              id="target-namespace"
              aria-label="Target namespace"
              isDisabled={!form.values.targetProvider}
            >
              {[
                <SelectGroup key="group" label="Type to search or to create a new namespace">
                  {namespaceOptions.map((option) => (
                    <SelectOption key={option.toString()} value={option} />
                  ))}
                </SelectGroup>,
              ]}
            </Select>
          </ResolvedQuery>
        </FormGroup>
      </Form>
    </ResolvedQueries>
  );
};

export default GeneralForm;
