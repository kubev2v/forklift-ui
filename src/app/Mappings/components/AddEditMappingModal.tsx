import * as React from 'react';
import * as yup from 'yup';
import { Modal, Button, Form, FormGroup, Grid, GridItem, Alert } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { MappingBuilder, IMappingBuilderItem } from './MappingBuilder';
import { getMappingFromBuilderItems } from './MappingBuilder/helpers';
import { Mapping, MappingType, IOpenShiftProvider, IVMwareProvider } from '@app/queries/types';
import { useProvidersQuery, useMappingResourceQueries } from '@app/queries';
import { updateMockStorage } from '@app/queries/mocks/helpers';
import './AddEditMappingModal.css';
import { usePausedPollingEffect } from '@app/common/context';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import { useFormField, useFormState } from '@app/common/hooks/useFormState';
import ValidatedTextInput from '@app/common/components/ValidatedTextInput';

interface IAddEditMappingModalProps {
  title: string;
  onClose: () => void;
  mappingType: MappingType;
}

const useMappingFormState = () => ({
  mapping: useFormState({
    name: useFormField('', yup.string().label('Mapping name').required()),
    sourceProvider: useFormField<IVMwareProvider | null>(
      null,
      yup.mixed<IVMwareProvider>().label('Source provider').required()
    ),
    targetProvider: useFormField<IOpenShiftProvider | null>(
      null,
      yup.mixed<IOpenShiftProvider>().label('Target provider').required()
    ),
  }),
  networkMapping: useFormState({
    mapping: useFormField<Mapping | null>(null, yup.mixed<Mapping>().required()),
    isSaveNewMapping: useFormField(false, yup.boolean().required()),
    newMappingName: useFormField('', yup.string()),
  }),
  storageMapping: useFormState({
    mapping: useFormField<Mapping | null>(null, yup.mixed<Mapping>().required()),
    isSaveNewMapping: useFormField(false, yup.boolean().required()),
    newMappingName: useFormField('', yup.string()),
  }),
});

export type MappingFormState = ReturnType<typeof useMappingFormState>;

const AddEditMappingModal: React.FunctionComponent<IAddEditMappingModalProps> = ({
  title,
  onClose,
  mappingType,
}: IAddEditMappingModalProps) => {
  const forms = useMappingFormState();
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
    forms.mapping.values.sourceProvider,
    forms.mapping.values.targetProvider,
    mappingType
  );

  // TODO add support for prefilling builderItems for editing an API mapping
  const [builderItems, setBuilderItems] = React.useState<IMappingBuilderItem[]>([
    { source: null, target: null },
  ]);

  React.useEffect(() => {
    // If you change providers, reset the mapping selections.
    setBuilderItems([{ source: null, target: null }]);
  }, [forms.mapping.values.sourceProvider, forms.mapping.values.targetProvider]);

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
            if (forms.mapping.values.sourceProvider && forms.mapping.values.targetProvider) {
              const generatedMapping = getMappingFromBuilderItems({
                mappingType,
                mappingName: forms.mapping.fields.name.value,
                sourceProvider: forms.mapping.values.sourceProvider,
                targetProvider: forms.mapping.values.targetProvider,
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
                <Form>
                  <ValidatedTextInput
                    field={forms.mapping.fields.name}
                    label="Name"
                    isRequired
                    fieldId="mapping-name"
                  />
                </Form>
              </GridItem>
              <GridItem />
              <GridItem sm={12} md={5}>
                <FormGroup
                  label="Source provider"
                  isRequired
                  fieldId="source-provider"
                  helperTextInvalid={forms.mapping.fields.sourceProvider.error}
                  validated={forms.mapping.fields.sourceProvider.isValid ? 'default' : 'error'}
                >
                  <SimpleSelect
                    id="source-provider"
                    aria-label="Source provider"
                    options={sourceProviderOptions}
                    value={[
                      sourceProviderOptions.find(
                        (option) => option.value === forms.mapping.fields.sourceProvider.value
                      ),
                    ]}
                    onChange={(selection) =>
                      forms.mapping.fields.sourceProvider.setValue(
                        (selection as OptionWithValue<IVMwareProvider>).value
                      )
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
                    aria-label="Target provider"
                    options={targetProviderOptions}
                    value={[
                      targetProviderOptions.find(
                        (option) => option.value === forms.mapping.fields.targetProvider.value
                      ),
                    ]}
                    onChange={(selection) =>
                      forms.mapping.fields.targetProvider.setValue(
                        (selection as OptionWithValue<IOpenShiftProvider>).value
                      )
                    }
                    placeholderText="Select a target provider..."
                  />
                </FormGroup>
              </GridItem>
              <GridItem sm={1} />
            </Grid>
            {forms.mapping.isValid ? (
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
