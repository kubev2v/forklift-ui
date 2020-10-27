import * as React from 'react';
import * as yup from 'yup';
import {
  Modal,
  Button,
  Form,
  FormGroup,
  Grid,
  GridItem,
  Alert,
  Stack,
  Flex,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  useFormField,
  useFormState,
  getFormGroupProps,
  ValidatedTextInput,
} from '@konveyor/lib-ui';

import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { MappingBuilder, IMappingBuilderItem, mappingBuilderItemsSchema } from './MappingBuilder';
import { getMappingFromBuilderItems } from './MappingBuilder/helpers';
import { MappingType, IOpenShiftProvider, IVMwareProvider } from '@app/queries/types';
import {
  useProvidersQuery,
  useMappingResourceQueries,
  useCreateMappingMutation,
} from '@app/queries';
import { usePausedPollingEffect } from '@app/common/context';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';

import './AddEditMappingModal.css';
import MutationStatus from '@app/common/components/MutationStatus';
import { dnsLabelNameSchema } from '@app/common/constants';

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
  usePausedPollingEffect();

  // TODO add support for prefilling form for editing an API mapping
  const form = useFormState({
    name: useFormField('', dnsLabelNameSchema.label('Mapping name').required()),
    sourceProvider: useFormField<IVMwareProvider | null>(
      null,
      yup.mixed<IVMwareProvider>().label('Source provider').required()
    ),
    targetProvider: useFormField<IOpenShiftProvider | null>(
      null,
      yup.mixed<IOpenShiftProvider>().label('Target provider').required()
    ),
    builderItems: useFormField<IMappingBuilderItem[]>(
      [{ source: null, target: null, highlight: false }],
      mappingBuilderItemsSchema
    ),
  });

  const providersQuery = useProvidersQuery();

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

  const mappingResourceQueries = useMappingResourceQueries(
    form.values.sourceProvider,
    form.values.targetProvider,
    mappingType
  );

  React.useEffect(() => {
    // If you change providers, reset the mapping selections.
    form.fields.builderItems.setValue([{ source: null, target: null, highlight: false }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.sourceProvider, form.values.targetProvider]);

  const [createMapping, createMappingResult] = useCreateMappingMutation(mappingType, onClose);

  return (
    <Modal
      className="addEditMappingModal"
      variant="medium"
      title={title}
      isOpen
      onClose={onClose}
      footer={
        <Stack hasGutter>
          <MutationStatus
            results={[createMappingResult]}
            errorTitles={['Error creating mapping']}
          />
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              key="confirm"
              variant="primary"
              onClick={() => {
                if (form.values.sourceProvider && form.values.targetProvider) {
                  const generatedMapping = getMappingFromBuilderItems({
                    mappingType,
                    mappingName: form.values.name,
                    sourceProvider: form.values.sourceProvider,
                    targetProvider: form.values.targetProvider,
                    builderItems: form.values.builderItems,
                  });
                  createMapping(generatedMapping);
                }
              }}
              isDisabled={!form.isValid || createMappingResult.isLoading}
            >
              Create
            </Button>
            <Button
              key="cancel"
              variant="link"
              onClick={onClose}
              isDisabled={createMappingResult.isLoading}
            >
              Cancel
            </Button>
          </Flex>
        </Stack>
      }
    >
      <Form className="extraSelectMargin">
        {providersQuery.isLoading ? (
          <LoadingEmptyState />
        ) : providersQuery.isError ? (
          <Alert variant="danger" isInline title="Error loading providers" />
        ) : (
          <>
            <Grid className={spacing.mbMd}>
              <GridItem sm={12} md={5} className={spacing.mbMd}>
                <ValidatedTextInput
                  field={form.fields.name}
                  label="Name"
                  isRequired
                  fieldId="mapping-name"
                />
              </GridItem>
              <GridItem />
              <GridItem sm={12} md={5}>
                <FormGroup
                  label="Source provider"
                  isRequired
                  fieldId="source-provider"
                  validated={form.fields.sourceProvider.isValid ? 'default' : 'error'}
                  {...getFormGroupProps(form.fields.sourceProvider)}
                >
                  <SimpleSelect
                    id="source-provider"
                    aria-label="Source provider"
                    options={sourceProviderOptions}
                    value={[
                      sourceProviderOptions.find(
                        (option) => option.value.name === form.values.sourceProvider?.name
                      ),
                    ]}
                    onChange={(selection) =>
                      form.fields.sourceProvider.setValue(
                        (selection as OptionWithValue<IVMwareProvider>).value
                      )
                    }
                    placeholderText="Select a source provider..."
                  />
                </FormGroup>
              </GridItem>
              <GridItem sm={1} />
              <GridItem sm={12} md={5}>
                <FormGroup
                  label="Target provider"
                  isRequired
                  fieldId="target-provider"
                  {...getFormGroupProps(form.fields.sourceProvider)}
                >
                  <SimpleSelect
                    id="target-provider"
                    aria-label="Target provider"
                    options={targetProviderOptions}
                    value={[
                      targetProviderOptions.find(
                        (option) => option.value.name === form.values.targetProvider?.name
                      ),
                    ]}
                    onChange={(selection) =>
                      form.fields.targetProvider.setValue(
                        (selection as OptionWithValue<IOpenShiftProvider>).value
                      )
                    }
                    placeholderText="Select a target provider..."
                  />
                </FormGroup>
              </GridItem>
              <GridItem sm={1} />
            </Grid>
            {form.values.sourceProvider && form.values.targetProvider ? (
              mappingResourceQueries.isLoading ? (
                <LoadingEmptyState />
              ) : mappingResourceQueries.isError ? (
                <Alert variant="danger" isInline title="Error loading mapping resources" />
              ) : (
                <MappingBuilder
                  mappingType={mappingType}
                  availableSources={mappingResourceQueries.availableSources}
                  availableTargets={mappingResourceQueries.availableTargets}
                  builderItems={form.values.builderItems}
                  setBuilderItems={form.fields.builderItems.setValue}
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
