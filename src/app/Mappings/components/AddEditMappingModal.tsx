import * as React from 'react';
import * as yup from 'yup';
import {
  Modal,
  Button,
  Form,
  FormGroup,
  Grid,
  GridItem,
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
import { MappingType, IOpenShiftProvider, IVMwareProvider, Mapping } from '@app/queries/types';
import {
  useProvidersQuery,
  useMappingResourceQueries,
  useCreateMappingMutation,
  getMappingNameSchema,
  useMappingsQuery,
  usePatchMappingMutation,
  findProvidersByRefs,
} from '@app/queries';
import { usePausedPollingEffect } from '@app/common/context';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';

import './AddEditMappingModal.css';
import { QueryResult } from 'react-query';
import { useEditingMappingPrefillEffect } from './helpers';
import { IKubeList } from '@app/client/types';
import {
  ResolvedQuery,
  ResolvedQueries,
  QuerySpinnerMode,
} from '@app/common/components/ResolvedQuery';

interface IAddEditMappingModalProps {
  title: string;
  onClose: () => void;
  mappingType: MappingType;
  mappingBeingEdited: Mapping | null;
}

const useMappingFormState = (
  mappingsQuery: QueryResult<IKubeList<Mapping>>,
  mappingBeingEdited: Mapping | null
) =>
  useFormState({
    name: useFormField(
      '',
      getMappingNameSchema(mappingsQuery, mappingBeingEdited).label('Mapping name').required()
    ),
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

export type MappingFormState = ReturnType<typeof useMappingFormState>;

const AddEditMappingModal: React.FunctionComponent<IAddEditMappingModalProps> = ({
  title,
  onClose,
  mappingType,
  mappingBeingEdited,
}: IAddEditMappingModalProps) => {
  usePausedPollingEffect();

  const mappingsQuery = useMappingsQuery(mappingType);
  const providersQuery = useProvidersQuery();

  const form = useMappingFormState(mappingsQuery, mappingBeingEdited);

  const mappingBeingEditedProviders = findProvidersByRefs(
    mappingBeingEdited?.spec.provider || null,
    providersQuery
  );

  const mappingResourceQueries = useMappingResourceQueries(
    form.values.sourceProvider || mappingBeingEditedProviders.sourceProvider,
    form.values.targetProvider || mappingBeingEditedProviders.targetProvider,
    mappingType
  );

  const { isDonePrefilling } = useEditingMappingPrefillEffect(
    form,
    mappingBeingEdited,
    mappingType,
    mappingBeingEditedProviders,
    providersQuery,
    mappingResourceQueries
  );

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

  // If you change providers, reset the mapping selections.
  React.useEffect(() => {
    if (isDonePrefilling) {
      form.fields.builderItems.setValue([{ source: null, target: null, highlight: false }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.sourceProvider, form.values.targetProvider]);

  const [createMapping, createMappingResult] = useCreateMappingMutation(mappingType, onClose);
  const [patchMapping, patchMappingResult] = usePatchMappingMutation(mappingType, onClose);
  const mutateMapping = !mappingBeingEdited ? createMapping : patchMapping;
  const mutationResult = !mappingBeingEdited ? createMappingResult : patchMappingResult;

  return (
    <Modal
      className="addEditMappingModal"
      variant="medium"
      title={title}
      isOpen
      onClose={onClose}
      footer={
        <Stack hasGutter>
          <ResolvedQuery
            result={mutationResult}
            errorTitle={`Error ${!mappingBeingEdited ? 'creating' : 'saving'} mapping`}
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
                  mutateMapping(generatedMapping);
                }
              }}
              isDisabled={!form.isValid || mutationResult.isLoading}
            >
              {!mappingBeingEdited ? 'Create' : 'Save'}
            </Button>
            <Button
              key="cancel"
              variant="link"
              onClick={onClose}
              isDisabled={mutationResult.isLoading}
            >
              Cancel
            </Button>
          </Flex>
        </Stack>
      }
    >
      <Form className="extraSelectMargin">
        {providersQuery.isLoading || !isDonePrefilling ? (
          <LoadingEmptyState />
        ) : providersQuery.isError ? (
          <ResolvedQuery result={providersQuery} errorTitle="Error loading providers" />
        ) : (
          <>
            <Grid className={spacing.mbMd}>
              <GridItem sm={12} md={5} className={spacing.mbMd}>
                <ValidatedTextInput
                  field={form.fields.name}
                  label="Name"
                  isRequired
                  fieldId="mapping-name"
                  inputProps={{
                    isDisabled: !!mappingBeingEdited,
                  }}
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
              <ResolvedQueries
                results={mappingResourceQueries.queries}
                errorTitles={[
                  'Error loading source provider resources',
                  'Error loading target provider resources',
                ]}
                spinnerMode={QuerySpinnerMode.EmptyState}
              >
                <MappingBuilder
                  mappingType={mappingType}
                  availableSources={mappingResourceQueries.availableSources}
                  availableTargets={mappingResourceQueries.availableTargets}
                  builderItems={form.values.builderItems}
                  setBuilderItems={form.fields.builderItems.setValue}
                />
              </ResolvedQueries>
            ) : null}
          </>
        )}
      </Form>
    </Modal>
  );
};

export default AddEditMappingModal;
