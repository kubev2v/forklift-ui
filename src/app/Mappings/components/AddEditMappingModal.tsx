import * as React from 'react';
import * as yup from 'yup';
import { Modal, Button, Form, Grid, GridItem, Stack, Flex } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useFormField, useFormState, ValidatedTextInput } from '@konveyor/lib-ui';

import { MappingBuilder, IMappingBuilderItem, mappingBuilderItemsSchema } from './MappingBuilder';
import { getMappingFromBuilderItems } from './MappingBuilder/helpers';
import { MappingType, IOpenShiftProvider, IVMwareProvider, Mapping } from '@app/queries/types';
import {
  useInventoryProvidersQuery,
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
import ProviderSelect from '@app/common/components/ProviderSelect';
import { ProviderType } from '@app/common/constants';

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
  const providersQuery = useInventoryProvidersQuery();

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
            spinnerMode={QuerySpinnerMode.Inline}
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
        <ResolvedQuery result={providersQuery} errorTitle="Error loading providers">
          {!isDonePrefilling ? (
            <LoadingEmptyState />
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
                  <ProviderSelect
                    label="Source provider"
                    providerType={ProviderType.vsphere}
                    field={form.fields.sourceProvider}
                  />
                </GridItem>
                <GridItem sm={1} />
                <GridItem sm={12} md={5}>
                  <ProviderSelect
                    label="Target provider"
                    providerType={ProviderType.openshift}
                    field={form.fields.targetProvider}
                  />
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
        </ResolvedQuery>
      </Form>
    </Modal>
  );
};

export default AddEditMappingModal;
