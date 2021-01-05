import * as React from 'react';
import { Form, FormGroup, TextArea, Title } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { getFormGroupProps, ValidatedTextInput } from '@konveyor/lib-ui';

import SimpleSelect from '@app/common/components/SimpleSelect';
import { IPlan } from '@app/queries/types';
import { useInventoryProvidersQuery } from '@app/queries';
import { PlanWizardFormState } from './PlanWizard';
import { useNamespacesQuery } from '@app/queries/namespaces';
import { QuerySpinnerMode, ResolvedQuery } from '@app/common/components/ResolvedQuery';
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
  const providersQuery = useInventoryProvidersQuery();
  const namespacesQuery = useNamespacesQuery(form.values.targetProvider);

  return (
    <ResolvedQuery result={providersQuery} errorTitle="Error loading providers">
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
            <SimpleSelect
              variant="typeahead"
              isCreatable
              id="target-namespace"
              aria-label="Target namespace"
              options={namespacesQuery.data?.map((namespace) => namespace.name) || []}
              value={form.values.targetNamespace}
              onChange={(selection) => form.fields.targetNamespace.setValue(selection as string)}
              placeholderText="Select a namespace"
              isDisabled={!form.values.targetProvider}
            />
          </ResolvedQuery>
        </FormGroup>
      </Form>
    </ResolvedQuery>
  );
};

export default GeneralForm;
