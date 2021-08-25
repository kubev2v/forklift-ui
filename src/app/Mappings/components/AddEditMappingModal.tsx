import * as React from 'react';
import * as yup from 'yup';
import {
  Modal,
  Button,
  Form,
  Grid,
  GridItem,
  Stack,
  Flex,
  FormGroup,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useFormField, useFormState, ValidatedTextInput } from '@konveyor/lib-ui';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { MappingBuilder, IMappingBuilderItem, mappingBuilderItemsSchema } from './MappingBuilder';
import { getMappingFromBuilderItems } from './MappingBuilder/helpers';
import {
  MappingType,
  IOpenShiftProvider,
  Mapping,
  SourceInventoryProvider,
} from '@app/queries/types';
import {
  useInventoryProvidersQuery,
  useMappingResourceQueries,
  useCreateMappingMutation,
  getMappingNameSchema,
  useMappingsQuery,
  usePatchMappingMutation,
  findProvidersByRefs,
  useClusterProvidersQuery,
} from '@app/queries';
import { usePausedPollingEffect } from '@app/common/context';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';

import './AddEditMappingModal.css';
import { UseQueryResult } from 'react-query';
import { useEditingMappingPrefillEffect } from './helpers';
import { IKubeList } from '@app/client/types';
import {
  ResolvedQuery,
  ResolvedQueries,
  QuerySpinnerMode,
} from '@app/common/components/ResolvedQuery';
import ProviderSelect from '@app/common/components/ProviderSelect';

interface IAddEditMappingModalProps {
  title: string;
  onClose: () => void;
  mappingType: MappingType;
  mappingBeingEdited: Mapping | null;
  setActiveMapType: React.Dispatch<React.SetStateAction<MappingType>>;
}

const useMappingFormState = (
  mappingsQuery: UseQueryResult<IKubeList<Mapping>>,
  mappingBeingEdited: Mapping | null
) =>
  useFormState({
    name: useFormField(
      '',
      getMappingNameSchema(mappingsQuery, mappingBeingEdited).label('Mapping name').required()
    ),
    sourceProvider: useFormField<SourceInventoryProvider | null>(
      null,
      yup.mixed<SourceInventoryProvider>().label('Source provider').required()
    ),
    targetProvider: useFormField<IOpenShiftProvider | null>(
      null,
      yup.mixed<IOpenShiftProvider>().label('Target provider').required()
    ),
    builderItems: useFormField<IMappingBuilderItem[]>(
      [{ source: null, target: null }],
      mappingBuilderItemsSchema
    ),
  });

export type MappingFormState = ReturnType<typeof useMappingFormState>;

const AddEditMappingModal: React.FunctionComponent<IAddEditMappingModalProps> = ({
  title,
  onClose,
  mappingType,
  mappingBeingEdited,
  setActiveMapType,
}: IAddEditMappingModalProps) => {
  usePausedPollingEffect();

  const mappingsQuery = useMappingsQuery(mappingType);
  const inventoryProvidersQuery = useInventoryProvidersQuery();
  const clusterProvidersQuery = useClusterProvidersQuery();

  const form = useMappingFormState(mappingsQuery, mappingBeingEdited);

  const mappingBeingEditedProviders = findProvidersByRefs(
    mappingBeingEdited?.spec.provider || null,
    inventoryProvidersQuery
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
    inventoryProvidersQuery,
    mappingResourceQueries
  );

  // If you change providers, reset the mapping selections.
  React.useEffect(() => {
    if (isDonePrefilling) {
      form.fields.builderItems.setValue([{ source: null, target: null }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.sourceProvider, form.values.targetProvider]);

  const createMappingMutation = useCreateMappingMutation(mappingType, onClose);
  const patchMappingMutation = usePatchMappingMutation(mappingType, onClose);

  const mutateMapping = !mappingBeingEdited
    ? createMappingMutation.mutate
    : patchMappingMutation.mutate;
  const mutationResult = !mappingBeingEdited ? createMappingMutation : patchMappingMutation;

  const MAPPING_TYPE_OPTIONS = Object.values(MappingType).map((type) => ({
    toString: () => MappingType[type],
    value: type,
  })) as OptionWithValue<MappingType>[];

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
            errorTitle={`Could not ${!mappingBeingEdited ? 'create' : 'save'} mapping`}
            spinnerMode={QuerySpinnerMode.Inline}
          />
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              id="modal-confirm-button"
              key="confirm"
              variant="primary"
              onClick={() => {
                if (form.values.sourceProvider && form.values.targetProvider) {
                  const generatedMapping = getMappingFromBuilderItems({
                    mappingType,
                    mappingName: form.values.name,
                    generateName: null,
                    sourceProvider: form.values.sourceProvider,
                    targetProvider: form.values.targetProvider,
                    builderItems: form.values.builderItems,
                  });
                  mutateMapping(generatedMapping);
                }
              }}
              isDisabled={!form.isDirty || !form.isValid || mutationResult.isLoading}
            >
              {!mappingBeingEdited ? 'Create' : 'Save'}
            </Button>
            <Button
              id="modal-cancel-button"
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
        <ResolvedQueries
          results={[inventoryProvidersQuery, clusterProvidersQuery]}
          errorTitles={[
            'Could not load provider inventory data',
            'Could not load providers from cluster',
          ]}
        >
          {!isDonePrefilling ? (
            <LoadingEmptyState />
          ) : (
            <>
              <Grid hasGutter className={spacing.mbMd}>
                <GridItem md={6}>
                  <FormGroup label="Type" isRequired fieldId="mapping-type">
                    <SimpleSelect
                      id="mapping-type"
                      aria-label="Mapping type"
                      options={MAPPING_TYPE_OPTIONS}
                      value={[MAPPING_TYPE_OPTIONS.find((option) => option.value === mappingType)]}
                      onChange={(selection) => {
                        setActiveMapType(MappingType[selection.toString()]);
                      }}
                      placeholderText="Select a mapping type..."
                      isDisabled={!!mappingBeingEdited}
                      menuAppendTo="parent"
                      maxHeight="40vh"
                    />
                  </FormGroup>
                </GridItem>
                <GridItem md={6} className={spacing.mbMd}>
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
                <GridItem md={6}>
                  <ProviderSelect
                    providerRole="source"
                    field={form.fields.sourceProvider}
                    notReadyTooltipPosition="right"
                    menuAppendTo="parent"
                    maxHeight="40vh"
                  />
                </GridItem>
                <GridItem md={6}>
                  <ProviderSelect
                    providerRole="target"
                    field={form.fields.targetProvider}
                    menuAppendTo="parent"
                    maxHeight="40vh"
                  />
                </GridItem>
              </Grid>
              {form.values.sourceProvider && form.values.targetProvider ? (
                <ResolvedQueries
                  results={mappingResourceQueries.queries}
                  errorTitles={[
                    'Could not load source provider resources',
                    'Could not load target provider resources',
                  ]}
                >
                  <MappingBuilder
                    mappingType={mappingType}
                    sourceProviderType={form.values.sourceProvider?.type || 'vsphere'}
                    availableSources={mappingResourceQueries.availableSources}
                    availableTargets={mappingResourceQueries.availableTargets}
                    builderItems={form.values.builderItems}
                    setBuilderItems={form.fields.builderItems.setValue}
                  />
                </ResolvedQueries>
              ) : null}
            </>
          )}
        </ResolvedQueries>
      </Form>
    </Modal>
  );
};

export default AddEditMappingModal;
