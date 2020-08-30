import * as React from 'react';
import { Modal, Button, Form, FormGroup, TextInput, Grid, GridItem } from '@patternfly/react-core';
import { MOCK_PROVIDERS } from '@app/Providers/mocks/providers.mock';
import { SOURCE_PROVIDER_TYPES, TARGET_PROVIDER_TYPES } from '@app/common/constants';
import SimpleSelect from '@app/common/components/SimpleSelect';
import './AddEditMappingModal.css';

interface IAddEditMappingModalProps {
  title: string;
  onClose: () => void;
}

// TODO paramaterize similarly to MappingsTable so it can be used for both network and storage mappings?
// Split it into AddEditNetworkMappingModal and AddEditStorageMappingModal if necessary

// TODO replace these with real state e.g. from redux
const providers = MOCK_PROVIDERS;

const AddEditMappingModal: React.FunctionComponent<IAddEditMappingModalProps> = ({
  title,
  onClose,
}: IAddEditMappingModalProps) => {
  const sourceProviderOptions = providers
    .filter((provider) => (SOURCE_PROVIDER_TYPES as string[]).includes(provider.spec.type))
    .map((provider) => provider.metadata.name);
  const targetProviderOptions = providers
    .filter((provider) => (TARGET_PROVIDER_TYPES as string[]).includes(provider.spec.type))
    .map((provider) => provider.metadata.name);

  console.log({ providers, sourceProviderOptions, targetProviderOptions });

  const [mappingName, setMappingName] = React.useState('');
  const [sourceProvider, setSourceProvider] = React.useState('');
  const [targetProvider, setTargetProvider] = React.useState('');

  return (
    <Modal
      className="addEditMappingModal"
      width="80%"
      title={title}
      isOpen
      onClose={onClose}
      actions={[
        <Button key="confirm" variant="primary" onClick={() => alert('TODO')}>
          Add
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>,
      ]}
    >
      <Form className="extraSelectMargin">
        <Grid sm={12} md={6} hasGutter>
          <FormGroup label="Name" isRequired fieldId="mapping-name">
            <TextInput
              id="mapping-name"
              value={mappingName}
              type="text"
              onChange={setMappingName}
            />
          </FormGroup>
          <GridItem />
          <FormGroup label="Source provider" isRequired fieldId="source-provider">
            <SimpleSelect
              id="source-provider"
              options={sourceProviderOptions}
              value={[sourceProviderOptions.find((option) => option === sourceProvider)]}
              onChange={(selection) => setSourceProvider(selection as string)}
              placeholderText="Select a source provider..."
            />
          </FormGroup>
          <FormGroup label="Target provider" isRequired fieldId="target-provider">
            <SimpleSelect
              id="target-provider"
              options={targetProviderOptions}
              value={[targetProviderOptions.find((option) => option === targetProvider)]}
              onChange={(selection) => setTargetProvider(selection as string)}
              placeholderText="Select a target provider..."
            />
          </FormGroup>
        </Grid>
      </Form>
    </Modal>
  );
};

export default AddEditMappingModal;
