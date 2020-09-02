import * as React from 'react';
import { Modal, Button, Form, FormGroup, TextInput, Grid, GridItem } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { MOCK_PROVIDERS } from '@app/Providers/mocks/providers.mock';
import { SOURCE_PROVIDER_TYPES, TARGET_PROVIDER_TYPES } from '@app/common/constants';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { MappingBuilder, IMappingBuilderItem } from './MappingBuilder';
import { getMappingFromBuilderItems } from './MappingBuilder/helpers';
import { MappingType, MappingSource, MappingTarget } from '../types';
import { ICNVProvider, IVMwareProvider } from '@app/Providers/types';
import {
  MOCK_VMWARE_NETWORKS_BY_PROVIDER,
  MOCK_CNV_NETWORKS_BY_PROVIDER,
} from '@app/Providers/mocks/networks.mock';
import { MOCK_VMWARE_DATASTORES_BY_PROVIDER } from '@app/Providers/mocks/datastores.mock';
<<<<<<< HEAD
import './AddEditMappingModal.css';
=======
import { updateMockStorage } from '../mocks/helpers';
>>>>>>> move mock function to its own file

interface IAddEditMappingModalProps {
  title: string;
  onClose: () => void;
  mappingType: MappingType;
}

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
    console.log(`TODO: fetch ${mappingType} items for ${sourceProvider?.metadata.name}`);
  }, [mappingType, sourceProvider]);

  React.useEffect(() => {
    console.log(`TODO: fetch ${mappingType} items for ${targetProvider?.metadata.name}`);
  }, [mappingType, targetProvider]);

  // TODO use the right thing from redux here instead of mock data
  let availableSources: MappingSource[] = [];
  let availableTargets: MappingTarget[] = [];
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

  // TODO add support for prefilling builderItems for editing an API mapping
  const [builderItems, setBuilderItems] = React.useState<IMappingBuilderItem[]>([
    { source: null, target: null },
  ]);

  React.useEffect(() => {
    // If you change providers, reset the mapping selections.
    setBuilderItems([{ source: null, target: null }]);
  }, [sourceProvider, targetProvider]);

  return (
    <Modal
      className="addEditMappingModal"
      variant="medium"
      title={title}
      isOpen
      onClose={onClose}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          onClick={() => {
<<<<<<< HEAD
            if (sourceProvider && targetProvider) {
              const generatedMapping = getMappingFromBuilderItems({
                mappingType,
                mappingName,
                sourceProvider,
                targetProvider,
                builderItems,
              });
              alert('TODO');
              console.log('TODO: API call with generated mapping: ', generatedMapping);
            }
=======
            //TODO: Replace with a real redux call for adding a mapping
            updateMockStorage({ mappingName, sourceProvider, targetProvider });
            onClose();
>>>>>>> move mock function to its own file
          }}
        >
          Create
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>,
      ]}
    >
      <Form className="extraSelectMargin">
        <Grid className={spacing.mbMd}>
          <GridItem sm={12} md={5} className={spacing.mbMd}>
            <FormGroup label="Name" isRequired fieldId="mapping-name">
              <TextInput
                id="mapping-name"
                value={mappingName}
                type="text"
                onChange={setMappingName}
              />
            </FormGroup>
          </GridItem>
          <GridItem />
          <GridItem sm={12} md={5}>
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
          </GridItem>
          <GridItem sm={1} />
          <GridItem sm={12} md={5}>
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
          </GridItem>
          <GridItem sm={1} />
        </Grid>
        {sourceProvider && targetProvider ? (
          <MappingBuilder
            mappingType={mappingType}
            availableSources={availableSources}
            availableTargets={availableTargets}
            builderItems={builderItems}
            setBuilderItems={setBuilderItems}
          />
        ) : null}
      </Form>
    </Modal>
  );
};

export default AddEditMappingModal;
