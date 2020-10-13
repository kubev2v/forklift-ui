import * as React from 'react';
import { Alert, Form, FormGroup, TextArea, Title } from '@patternfly/react-core';
import { ValidatedTextInput } from '@konveyor/lib-ui';

import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { IOpenShiftProvider, IVMwareProvider } from '@app/queries/types';
import { useProvidersQuery } from '@app/queries';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import { PlanWizardFormState } from './PlanWizard';

interface IGeneralFormProps {
  form: PlanWizardFormState['general'];
  onProviderChange: () => void;
}

const GeneralForm: React.FunctionComponent<IGeneralFormProps> = ({
  form,
  onProviderChange,
}: IGeneralFormProps) => {
  const providersQuery = useProvidersQuery();
  const vmwareProviders = providersQuery.data?.vsphere || [];
  const openshiftProviders = providersQuery.data?.openshift || [];

  if (providersQuery.isLoading) {
    return <LoadingEmptyState />;
  }
  if (providersQuery.isError) {
    return <Alert variant="danger" title="Error loading providers" />;
  }

  const sourceProvidersOptions = Object.values(vmwareProviders).map((provider) => ({
    toString: () => provider.name,
    value: provider,
  })) as OptionWithValue<IVMwareProvider>[];

  const targetProvidersOptions = Object.values(openshiftProviders).map((provider) => ({
    toString: () => provider.name,
    value: provider,
  })) as OptionWithValue<IOpenShiftProvider>[];

  return (
    <Form>
      <Title headingLevel="h2" size="md">
        Give your plan a name and a description
      </Title>

      <ValidatedTextInput
        field={form.fields.planName}
        label="Plan name"
        isRequired
        fieldId="plan-name"
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

      <FormGroup
        label="Source provider"
        isRequired
        fieldId="source-provider"
        helperTextInvalid={form.fields.sourceProvider.error}
        validated={form.fields.sourceProvider.isValid ? 'default' : 'error'}
      >
        <SimpleSelect
          id="source-provider"
          aria-label="Source provider"
          options={sourceProvidersOptions}
          value={[
            sourceProvidersOptions.find(
              (option) => option.value === form.fields.sourceProvider.value
            ),
          ]}
          onChange={(selection) => {
            form.fields.sourceProvider.setValue(
              (selection as OptionWithValue<IVMwareProvider>).value
            );
            onProviderChange();
          }}
          placeholderText="Select a provider"
        />
      </FormGroup>

      <FormGroup
        label="Target provider"
        isRequired
        fieldId="target-provider"
        helperTextInvalid={form.fields.targetProvider.error}
        validated={form.fields.targetProvider.isValid ? 'default' : 'error'}
      >
        <SimpleSelect
          id="target-provider"
          aria-label="Target provider"
          options={targetProvidersOptions}
          value={[
            targetProvidersOptions.find(
              (option) => option.value === form.fields.targetProvider.value
            ),
          ]}
          onChange={(selection) => {
            form.fields.targetProvider.setValue(
              (selection as OptionWithValue<IOpenShiftProvider>).value
            );
            onProviderChange();
          }}
          placeholderText="Select a provider"
        />
      </FormGroup>
    </Form>
  );
};

export default GeneralForm;
