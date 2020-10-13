import * as React from 'react';
import * as yup from 'yup';
import { Modal, Button, Form, FormGroup, Grid, GridItem, Alert } from '@patternfly/react-core';
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
import { useProvidersQuery, useMappingResourceQueries } from '@app/queries';
import { updateMockStorage } from '@app/queries/mocks/helpers';
import { usePausedPollingEffect } from '@app/common/context';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';

import './AddEditMappingModal.css';

import './AddEditMappingModal.css';

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
  // TODO add support for prefilling form for editing an API mapping
  const form = useFormState({
    name: useFormField('', yup.string().label('Mapping name').required()),
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
            if (form.values.sourceProvider && form.values.targetProvider) {
              const generatedMapping = getMappingFromBuilderItems({
                mappingType,
                mappingName: form.values.name,
                sourceProvider: form.values.sourceProvider,
                targetProvider: form.values.targetProvider,
                builderItems: form.values.builderItems,
              });
              //TODO: Update when real api call & validation is implemented
              updateMockStorage(generatedMapping);
              onClose();
            }
          }}
          isDisabled={!form.isValid}
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
                        (option) => option.value === form.fields.sourceProvider.value
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
                        (option) => option.value === form.fields.targetProvider.value
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
                <Alert variant="danger" title="Error loading mapping resources" />
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
