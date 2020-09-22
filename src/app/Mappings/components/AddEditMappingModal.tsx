import * as React from 'react';
import {
  Modal,
  Button,
  Form,
  FormGroup,
  TextInput,
  Grid,
  GridItem,
  Alert,
  Bullseye,
  EmptyState,
  Spinner,
  Title,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { MappingBuilder, IMappingBuilderItem } from './MappingBuilder';
import { getMappingFromBuilderItems } from './MappingBuilder/helpers';
import {
  MappingType,
  MappingSource,
  MappingTarget,
  IOpenShiftProvider,
  IVMwareProvider,
} from '@app/queries/types';
import {
  MOCK_VMWARE_NETWORKS_BY_PROVIDER,
  MOCK_OPENSHIFT_NETWORKS_BY_PROVIDER,
} from '@app/queries/mocks/networks.mock';
import { MOCK_VMWARE_DATASTORES_BY_PROVIDER } from '@app/queries/mocks/datastores.mock';
import { useProvidersQuery } from '@app/queries';
import { updateMockStorage } from '@app/queries/mocks/helpers';
import './AddEditMappingModal.css';

interface IAddEditMappingModalProps {
  title: string;
  onClose: () => void;
  mappingType: MappingType;
}

// TODO move these to a dependent query from providers
const MOCK_STORAGE_CLASSES = ['gold', 'silver', 'bronze'];

const AddEditMappingModal: React.FunctionComponent<IAddEditMappingModalProps> = ({
  title,
  onClose,
  mappingType,
}: IAddEditMappingModalProps) => {
  const {
    isLoading: isLoadingProviders,
    data: providersByType,
    status: providersQueryStatus,
  } = useProvidersQuery();

  // TODO these might be reusable for any other provider dropdowns elsewhere in the UI
  const sourceProviderOptions: OptionWithValue<IVMwareProvider>[] =
    isLoadingProviders || !providersByType
      ? []
      : providersByType.vsphere.map((provider) => ({
          value: provider,
          toString: () => provider.name,
        }));
  const targetProviderOptions: OptionWithValue<IOpenShiftProvider>[] =
    isLoadingProviders || !providersByType
      ? []
      : providersByType.openshift.map((provider) => ({
          value: provider,
          toString: () => provider.name,
        }));

  const [mappingName, setMappingName] = React.useState('');
  const [sourceProvider, setSourceProvider] = React.useState<IVMwareProvider | null>(null);
  const [targetProvider, setTargetProvider] = React.useState<IOpenShiftProvider | null>(null);

  React.useEffect(() => {
    console.log(`TODO: fetch ${mappingType} items for ${sourceProvider?.name}`);
  }, [mappingType, sourceProvider]);

  React.useEffect(() => {
    console.log(`TODO: fetch ${mappingType} items for ${targetProvider?.name}`);
  }, [mappingType, targetProvider]);

  // TODO use the right thing from react-query here instead of mock data
  let availableSources: MappingSource[] = [];
  let availableTargets: MappingTarget[] = [];
  if (mappingType === MappingType.Network) {
    availableSources = sourceProvider ? MOCK_VMWARE_NETWORKS_BY_PROVIDER[sourceProvider.name] : [];
    availableTargets = targetProvider
      ? MOCK_OPENSHIFT_NETWORKS_BY_PROVIDER[targetProvider?.name]
      : [];
  }
  if (mappingType === MappingType.Storage) {
    availableSources = sourceProvider
      ? MOCK_VMWARE_DATASTORES_BY_PROVIDER[sourceProvider.name]
      : [];
    availableTargets = targetProvider ? MOCK_STORAGE_CLASSES : [];
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
            if (sourceProvider && targetProvider) {
              const generatedMapping = getMappingFromBuilderItems({
                mappingType,
                mappingName,
                sourceProvider,
                targetProvider,
                builderItems,
              });
              //TODO: Update when real api call & validation is implemented
              updateMockStorage(generatedMapping);
              onClose();
            }
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
        {isLoadingProviders ? (
          <Bullseye>
            <EmptyState variant="large">
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2">Loading...</Title>
            </EmptyState>
          </Bullseye>
        ) : providersQueryStatus === 'error' ? (
          <Alert variant="danger" title="Error loading providers" />
        ) : (
          <>
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
                    value={[
                      sourceProviderOptions.find((option) => option.value === sourceProvider),
                    ]}
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
                    value={[
                      targetProviderOptions.find((option) => option.value === targetProvider),
                    ]}
                    onChange={(selection) =>
                      setTargetProvider((selection as OptionWithValue<IOpenShiftProvider>).value)
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
          </>
        )}
      </Form>
    </Modal>
  );
};

export default AddEditMappingModal;
