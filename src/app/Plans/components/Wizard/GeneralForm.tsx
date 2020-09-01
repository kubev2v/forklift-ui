import * as React from 'react';
import { Form, FormGroup, TextArea, TextInput, Title } from '@patternfly/react-core';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { Provider } from '@app/Providers/types';

interface IGeneralFormComponent {
  sourceProviders: Provider[];
  targetProviders: Provider[];
}

const GeneralForm: React.FunctionComponent<IGeneralFormComponent> = ({
  sourceProviders,
  targetProviders,
}: IGeneralFormComponent) => {
  const [planName, setPlanName] = React.useState<string>('');
  const [planDesc, setPlanDesc] = React.useState<string>('');
  const [srcProvider, setSrcProvider] = React.useState<Provider | null>(null);
  const [tgtProvider, setTgtProvider] = React.useState<Provider | null>(null);

  const sourceProvidersOptions = Object.values(sourceProviders).map((provider) => ({
    toString: () => provider.metadata.name,
    value: provider,
  })) as OptionWithValue<Provider>[];

  const targetProvidersOptions = Object.values(targetProviders).map((provider) => ({
    toString: () => provider.metadata.name,
    value: provider,
  })) as OptionWithValue<Provider>[];

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
        fieldId="planDesc"
        helperTextInvalid="TODO"
        validated="default" // TODO add state/validation/errors to this and other FormGroups
      >
        <TextArea id="planDesc" type="text" value={planDesc} onChange={setPlanDesc} />
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
          value={[sourceProvidersOptions.find((option) => option.value === srcProvider)]}
          onChange={(selection) => setSrcProvider((selection as OptionWithValue<Provider>).value)}
          placeholderText="Select a provider"
        />
      </FormGroup>

      <FormGroup
        label="Target provider"
        isRequired
        fieldId="tgtProvider"
        helperTextInvalid="TODO"
        validated="default" // TODO add state/validation/errors to this and other FormGroups
      >
        <SimpleSelect
          id="tgtProvider"
          options={targetProvidersOptions}
          value={[targetProvidersOptions.find((option) => option.value === tgtProvider)]}
          onChange={(selection) => setTgtProvider((selection as OptionWithValue<Provider>).value)}
          placeholderText="Select a provider"
        />
      </FormGroup>
    </Form>
  );
};

export default GeneralForm;
