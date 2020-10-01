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
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { MappingBuilder, IMappingBuilderItem } from './MappingBuilder';
import { getMappingFromBuilderItems } from './MappingBuilder/helpers';
import { MappingType, IOpenShiftProvider, IVMwareProvider } from '@app/queries/types';
import { useProvidersQuery, useMappingResourceQueries } from '@app/queries';
import { updateMockStorage } from '@app/queries/mocks/helpers';
import './AddEditMappingModal.css';
import { usePausedPollingEffect } from '@app/common/context';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';

interface IAddEditMappingModalProps {
  title: string;
  onClose: () => void;
  mappingType: MappingType;
}

const AddEditMappingModal: React.FunctionComponent<IAddEditMappingModalProps> = ({
  title,
  onClose,
  mappingType,
}: IAddEditMappingModalProps) => {
  const providersQuery = useProvidersQuery();
  usePausedPollingEffect();

  // TODO these might be reusable for any other provider dropdowns elsewhere in the UI
  const sourceProviderOptions: OptionWithValue<IVMwareProvider>[] =
    providersQuery.isLoading || !providersQuery.data
      ? []
      : providersQuery.data.vsphere.map((provider) => ({
          value: provider,
          toString: () => provider.name,
        }));
  const targetProviderOptions: OptionWithValue<IOpenShiftProvider>[] =
    providersQuery.isLoading || !providersQuery.data
      ? []
      : providersQuery.data.openshift.map((provider) => ({
          value: provider,
          toString: () => provider.name,
        }));

  const [mappingName, setMappingName] = React.useState('');
  const [sourceProvider, setSourceProvider] = React.useState<IVMwareProvider | null>(null);
  const [targetProvider, setTargetProvider] = React.useState<IOpenShiftProvider | null>(null);

  const mappingResourceQueries = useMappingResourceQueries(
    sourceProvider,
    targetProvider,
    mappingType
  );

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
          isDisabled={!builderItems.every((item) => item.source && item.target)}
        >
          Create
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>,
      ]}
    >
      <Form className="extraSelectMargin">
        {providersQuery.isLoading ? (
          <LoadingEmptyState />
        ) : providersQuery.isError ? (
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
              mappingResourceQueries.isLoading ? (
                <LoadingEmptyState />
              ) : mappingResourceQueries.isError ? (
                <Alert variant="danger" title="Error loading mapping resources" />
              ) : (
                <MappingBuilder
                  mappingType={mappingType}
                  availableSources={mappingResourceQueries.availableSources}
                  availableTargets={mappingResourceQueries.availableTargets}
                  builderItems={builderItems}
                  setBuilderItems={setBuilderItems}
                />
              )
            ) : null}
          </>
        )}
      </Form>
    </Modal>
  );
};

export default AddEditMappingModal;
