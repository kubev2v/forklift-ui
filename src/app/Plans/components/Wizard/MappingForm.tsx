import * as React from 'react';
import {
  Checkbox,
  Grid,
  GridItem,
  TextContent,
  Text,
  Form,
  FormGroup,
  Flex,
  FlexItem,
  Alert,
  Select,
  SelectOption,
  SelectGroup,
  SelectOptionObject,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ValidatedTextInput } from '@konveyor/lib-ui';

import { OptionWithValue } from '@app/common/components/SimpleSelect';
import {
  MappingType,
  Mapping,
  IVMwareProvider,
  IOpenShiftProvider,
  IVMwareVM,
} from '@app/queries/types';
import { MappingBuilder, IMappingBuilderItem } from '@app/Mappings/components/MappingBuilder';
import { useMappingResourceQueries } from '@app/queries';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import { PlanWizardFormState } from './PlanWizard';
import { getBuilderItemsFromMapping } from '@app/Mappings/components/MappingBuilder/helpers';

import './MappingForm.css';
import { fetchMockStorage } from '@app/queries/mocks/helpers';
import { filterSourcesBySelectedVMs } from './helpers';

interface IMappingFormProps {
  form: PlanWizardFormState['storageMapping'] | PlanWizardFormState['networkMapping'];
  sourceProvider: IVMwareProvider | null;
  targetProvider: IOpenShiftProvider | null;
  mappingType: MappingType;
  selectedVMs: IVMwareVM[];
}

const MappingForm: React.FunctionComponent<IMappingFormProps> = ({
  form,
  sourceProvider,
  targetProvider,
  mappingType,
  selectedVMs,
}: IMappingFormProps) => {
  const mappingResourceQueries = useMappingResourceQueries(
    sourceProvider,
    targetProvider,
    mappingType
  );

  const requiredSources = filterSourcesBySelectedVMs(
    mappingResourceQueries.availableSources,
    selectedVMs,
    mappingType
  );

  const mappingsQueryData = fetchMockStorage(mappingType) as Mapping[] | undefined; // TODO replace this with a real query
  const filteredMappings = (mappingsQueryData || []).filter(
    // TODO this probably needs to use type/id, whatever we end up having for real mapping provider references
    ({ provider: { source, target } }) =>
      source.selfLink === sourceProvider?.selfLink && target.selfLink === targetProvider?.selfLink
  );

  const [isMappingSelectOpen, setIsMappingSelectOpen] = React.useState(false);

  const newMappingOption = {
    toString: () => `Create a new ${mappingType.toLowerCase()} mapping`,
    value: 'new',
  };
  const mappingOptions = Object.values(filteredMappings).map((mapping) => ({
    toString: () => mapping.name,
    value: mapping,
  })) as OptionWithValue<Mapping>[];

  const populateMappingBuilder = (mapping?: Mapping) => {
    let newBuilderItems: IMappingBuilderItem[] = !mapping
      ? []
      : getBuilderItemsFromMapping(mapping, mappingResourceQueries.availableSources);
    const missingSources = requiredSources.filter(
      (source) => !newBuilderItems.some((item) => item.source?.selfLink === source.selfLink)
    );
    newBuilderItems = [
      ...newBuilderItems,
      ...missingSources.map(
        (source): IMappingBuilderItem => ({ source, target: null, highlight: !!mapping })
      ),
    ];
    form.fields.builderItems.setValue(newBuilderItems);
    form.fields.isSaveNewMapping.setValue(false);
  };

  const hasAddedItems = form.values.selectedExistingMapping
    ? form.values.selectedExistingMapping.items.length < form.values.builderItems.length
    : false;

  if (mappingResourceQueries.isLoading) {
    return <LoadingEmptyState />;
  }
  if (mappingResourceQueries.isError) {
    return <Alert variant="danger" title="Error loading mapping resources" />;
  }

  return (
    <Form>
      <TextContent>
        <Text component="p">
          Start with an existing {mappingType.toLowerCase()} mapping between your source and target
          providers, or create a new one.
        </Text>
      </TextContent>
      <Flex direction={{ default: 'column' }} className={spacing.mbMd}>
        <FlexItem>
          <FormGroup isRequired fieldId="mappingSelect">
            <Select
              id="mappingSelect"
              aria-label="Select mapping"
              placeholderText={`Select a ${mappingType.toLowerCase()} mapping`}
              isGrouped
              isOpen={isMappingSelectOpen}
              onToggle={setIsMappingSelectOpen}
              onSelect={(_event, selection: SelectOptionObject) => {
                const sel = selection as OptionWithValue<Mapping | 'new'>;
                if (sel.value === 'new') {
                  form.fields.isCreateMappingSelected.setValue(true);
                  form.fields.selectedExistingMapping.setValue(null);
                  populateMappingBuilder();
                } else {
                  form.fields.isCreateMappingSelected.setValue(false);
                  form.fields.selectedExistingMapping.setValue(sel.value);
                  populateMappingBuilder(sel.value);
                }
                setIsMappingSelectOpen(false);
              }}
              selections={
                form.values.isCreateMappingSelected
                  ? [newMappingOption]
                  : form.values.selectedExistingMapping
                  ? [
                      mappingOptions.find(
                        (option) => option.value.name === form.values.selectedExistingMapping?.name
                      ),
                    ]
                  : []
              }
            >
              <SelectOption key={newMappingOption.toString()} value={newMappingOption} />
              <SelectGroup
                label={
                  mappingOptions.length > 0
                    ? 'Existing mappings'
                    : 'No existing mappings match your selected providers'
                }
              >
                {mappingOptions.map((option) => (
                  <SelectOption key={option.toString()} value={option} />
                ))}
              </SelectGroup>
            </Select>
          </FormGroup>
        </FlexItem>

        {(form.values.isCreateMappingSelected || form.values.selectedExistingMapping) && (
          <>
            <MappingBuilder
              mappingType={mappingType}
              availableSources={mappingResourceQueries.availableSources}
              availableTargets={mappingResourceQueries.availableTargets}
              builderItems={form.values.builderItems}
              setBuilderItems={form.fields.builderItems.setValue}
              isWizardMode
              hasItemsAddedMessage={hasAddedItems}
            />
            {form.values.isCreateMappingSelected || hasAddedItems ? (
              <>
                <Checkbox
                  label="Save mapping to use again"
                  aria-label="save mapping checkbox"
                  id="save-mapping-check"
                  isChecked={form.values.isSaveNewMapping}
                  onChange={() =>
                    form.fields.isSaveNewMapping.setValue(!form.values.isSaveNewMapping)
                  }
                  className={spacing.mtMd}
                />
                {form.values.isSaveNewMapping && (
                  <Grid className={spacing.mbMd}>
                    <GridItem sm={12} md={5} className={spacing.mbMd}>
                      <ValidatedTextInput
                        field={form.fields.newMappingName}
                        label="Name"
                        fieldId="new-mapping-name"
                      />
                    </GridItem>
                  </Grid>
                )}
              </>
            ) : null}
          </>
        )}
      </Flex>
    </Form>
  );
};

export default MappingForm;
