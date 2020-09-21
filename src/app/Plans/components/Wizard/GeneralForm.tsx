import * as React from 'react';
import { Form, FormGroup, TextArea, TextInput, Title } from '@patternfly/react-core';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { IOpenShiftProvider, IVMwareProvider } from '@app/queries/types';

interface IGeneralFormComponentProps {
  sourceProviders: IVMwareProvider[];
  targetProviders: IOpenShiftProvider[];
}

const GeneralForm: React.FunctionComponent<IGeneralFormComponentProps> = ({
  sourceProviders,
  targetProviders,
}: IGeneralFormComponentProps) => {
  const [planName, setPlanName] = React.useState<string>('');
  const [planDescription, setPlanDescription] = React.useState<string>('');
  const [sourceProvider, setSourceProvider] = React.useState<IVMwareProvider | null>(null);
  const [targetProvider, setTargetProvider] = React.useState<IOpenShiftProvider | null>(null);

  const sourceProvidersOptions = Object.values(sourceProviders).map((provider) => ({
    toString: () => provider.name,
    value: provider,
  })) as OptionWithValue<IVMwareProvider>[];

  const targetProvidersOptions = Object.values(targetProviders).map((provider) => ({
    toString: () => provider.name,
    value: provider,
  })) as OptionWithValue<IOpenShiftProvider>[];

  return (
    <Form>
      <Title headingLevel="h1" size="md">
        Give your plan a name and a description
      </Title>
      <FormGroup
        label="Plan name"
        isRequired
        fieldId="planName"
        helperTextInvalid="TODO"
        validated="default" // TODO add state/validation/errors to this and other FormGroups
      >
        <TextInput id="planName" value={planName} type="text" onChange={setPlanName} />
      </FormGroup>

      <FormGroup
        label="Plan description"
        fieldId="planDescription"
        helperTextInvalid="TODO"
        validated="default" // TODO add state/validation/errors to this and other FormGroups
      >
        <TextArea
          id="planDescription"
          type="text"
          value={planDescription}
          onChange={setPlanDescription}
        />
      </FormGroup>

      <Title headingLevel="h3" size="md" /* className={styles.fieldGridTitle} */>
        Select source and target providers
      </Title>
      <FormGroup
        label="Source Provider"
        isRequired
        fieldId="sourceProvider"
        helperTextInvalid="TODO"
        validated="default" // TODO add state/validation/errors to this and other FormGroups
      >
        <SimpleSelect
          id="sourceProvider"
          options={sourceProvidersOptions}
          value={[sourceProvidersOptions.find((option) => option.value === sourceProvider)]}
          onChange={(selection) =>
            setSourceProvider((selection as OptionWithValue<IVMwareProvider>).value)
          }
          placeholderText="Select a provider"
        />
      </FormGroup>

      <FormGroup
        label="Target provider"
        isRequired
        fieldId="targetProvider"
        helperTextInvalid="TODO"
        validated="default" // TODO add state/validation/errors to this and other FormGroups
      >
        <SimpleSelect
          id="targetProvider"
          options={targetProvidersOptions}
          value={[targetProvidersOptions.find((option) => option.value === targetProvider)]}
          onChange={(selection) =>
            setTargetProvider((selection as OptionWithValue<IOpenShiftProvider>).value)
          }
          placeholderText="Select a provider"
        />
      </FormGroup>
    </Form>
  );
};

export default GeneralForm;
