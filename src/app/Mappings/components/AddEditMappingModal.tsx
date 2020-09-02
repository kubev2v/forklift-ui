import * as React from 'react';
import { Modal, Button, Form, FormGroup, TextInput, Grid, GridItem } from '@patternfly/react-core';
import { MOCK_PROVIDERS } from '@app/Providers/mocks/providers.mock';
import { SOURCE_PROVIDER_TYPES, TARGET_PROVIDER_TYPES } from '@app/common/constants';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import './AddEditMappingModal.css';
import MappingBuilder from './MappingBuilder';
import { MappingType } from '../types';
import {
  IVMwareNetwork,
  ICNVNetwork,
  IVMwareDatastore,
  ICNVProvider,
  IVMwareProvider,
} from '@app/Providers/types';
import {
  MOCK_VMWARE_NETWORKS_BY_PROVIDER,
  MOCK_CNV_NETWORKS_BY_PROVIDER,
} from '@app/Providers/mocks/networks.mock';
import { MOCK_VMWARE_DATASTORES_BY_PROVIDER } from '@app/Providers/mocks/datastores.mock';

interface IAddEditMappingModalProps {
  title: string;
  onClose: () => void;
  mappingType: MappingType;
}

// TODO paramaterize similarly to MappingsTable so it can be used for both network and storage mappings?
// Split it into AddEditNetworkMappingModal and AddEditStorageMappingModal if necessary

// TODO replace these with real state e.g. from redux
const providers = MOCK_PROVIDERS;

const AddEditMappingModal: React.FunctionComponent<IAddEditMappingModalProps> = ({
  title,
  onClose,
  mappingType,
}: IAddEditMappingModalProps) => {
  // TODO these might be reusable for any other provider dropdowns elsewhere in the UI
  const sourceProviderOptions: OptionWithValue<IVMwareProvider>[] = providers
    .filter((provider) => (SOURCE_PROVIDER_TYPES as string[]).includes(provider.spec.type))
    .map((provider) => ({
      value: provider as IVMwareProvider,
      toString: () => provider.metadata.name,
    }));
  const targetProviderOptions: OptionWithValue<ICNVProvider>[] = providers
    .filter((provider) => (TARGET_PROVIDER_TYPES as string[]).includes(provider.spec.type))
    .map((provider) => ({
      value: provider as ICNVProvider,
      toString: () => provider.metadata.name,
    }));

  const [mappingName, setMappingName] = React.useState('');
  const [sourceProvider, setSourceProvider] = React.useState<IVMwareProvider | null>(null);
  const [targetProvider, setTargetProvider] = React.useState<ICNVProvider | null>(null);

  React.useEffect(() => {
    console.log(`TODO: fetch ${mappingType} items for ${sourceProvider}`);
  }, [mappingType, sourceProvider]);

  React.useEffect(() => {
    console.log(`TODO: fetch ${mappingType} items for ${targetProvider}`);
  }, [mappingType, targetProvider]);

  // TODO use the right thing from redux here instead of mock data
  let availableSources: IVMwareNetwork[] | IVMwareDatastore[] = [];
  let availableTargets: ICNVNetwork[] | string[] = []; // strings = storage classes
  if (mappingType === MappingType.Network) {
    availableSources = sourceProvider
      ? MOCK_VMWARE_NETWORKS_BY_PROVIDER[sourceProvider.metadata.name]
      : [];
    availableTargets = targetProvider
      ? MOCK_CNV_NETWORKS_BY_PROVIDER[targetProvider?.metadata.name]
      : [];
  }
  if (mappingType === MappingType.Storage) {
    availableSources = sourceProvider
      ? MOCK_VMWARE_DATASTORES_BY_PROVIDER[sourceProvider.metadata.name]
      : [];
    availableTargets = targetProvider ? targetProvider.metadata.storageClasses : [];
  }

  return (
    <Modal
      className="addEditMappingModal"
      width="80%"
      title={title}
      isOpen
      onClose={onClose}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          onClick={() => {
            const mappingsKey = localStorage.getItem('mappingsObject' || '{}');
            const currentMappings = mappingsKey !== null ? JSON.parse(mappingsKey) : {};
            const mockMappings = {
              mappings: [
                {
                  name: mappingName,
                  sourceProvider: sourceProvider,
                  targetProvider: targetProvider,
                },
                ...currentMappings.mappings,
              ],
            };
            localStorage.setItem('mappingsObject', JSON.stringify(mockMappings));
          }}
        >
          Add
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>,
      ]}
    >
      <Form className={!sourceProvider || !targetProvider ? 'extraSelectMargin' : ''}>
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
              value={[sourceProviderOptions.find((option) => option.value === sourceProvider)]}
              onChange={(selection) =>
                setSourceProvider((selection as OptionWithValue<IVMwareProvider>).value)
              }
              placeholderText="Select a source provider..."
            />
          </FormGroup>
          <FormGroup label="Target provider" isRequired fieldId="target-provider">
            <SimpleSelect
              id="target-provider"
              options={targetProviderOptions}
              value={[targetProviderOptions.find((option) => option.value === targetProvider)]}
              onChange={(selection) =>
                setTargetProvider((selection as OptionWithValue<ICNVProvider>).value)
              }
              placeholderText="Select a target provider..."
            />
          </FormGroup>
        </Grid>
        {sourceProvider && targetProvider ? (
          <MappingBuilder
            mappingType={mappingType}
            sourceProvider={sourceProvider}
            targetProvider={targetProvider}
            availableSources={availableSources}
            availableTargets={availableTargets}
          />
        ) : null}
      </Form>
    </Modal>
  );
};

export default AddEditMappingModal;
