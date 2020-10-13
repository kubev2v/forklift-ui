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
import { MappingType, Mapping, IVMwareProvider, IOpenShiftProvider } from '@app/queries/types';
import { MappingBuilder, IMappingBuilderItem } from '@app/Mappings/components/MappingBuilder';
import { useMappingResourceQueries } from '@app/queries';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import { PlanWizardFormState } from './PlanWizard';
import { getBuilderItemsFromMapping } from '@app/Mappings/components/MappingBuilder/helpers';
import { usePausedPollingEffect } from '@app/common/context';

import './MappingForm.css';
import { fetchMockStorage } from '@app/queries/mocks/helpers';

interface IMappingFormProps {
  form: PlanWizardFormState['storageMapping'] | PlanWizardFormState['networkMapping'];
  sourceProvider: IVMwareProvider | null;
  targetProvider: IOpenShiftProvider | null;
  mappingType: MappingType;
}

const MappingForm: React.FunctionComponent<IMappingFormProps> = ({
  form,
  sourceProvider,
  targetProvider,
  mappingType,
}: IMappingFormProps) => {
  usePausedPollingEffect(); // Polling can interfere with mapping builder state

  const mappingResourceQueries = useMappingResourceQueries(
    sourceProvider,
    targetProvider,
    mappingType
  );

  const mappingsQueryData = fetchMockStorage(mappingType) as Mapping[] | undefined; // TODO replace this with a real query
  const filteredMappings = (mappingsQueryData || []).filter(
    // TODO this probably needs to use type/id, whatever we end up having for real mapping provider references
    ({ provider: { source, target } }) =>
      source.selfLink === sourceProvider?.selfLink && target.selfLink === targetProvider?.selfLink
  );

  const [isMappingSelectOpen, setIsMappingSelectOpen] = React.useState(false);
  const [isCreateMappingSelected, setIsCreateMappingSelected] = React.useState(false);
  const [selectedExistingMapping, setSelectedExistingMapping] = React.useState<Mapping | null>(
    null
  );

  const newMappingOption = {
    toString: () => `Create a new ${mappingType.toLowerCase()} mapping`,
    value: 'new',
  };
  const mappingOptions = Object.values(filteredMappings).map((mapping) => ({
    toString: () => mapping.name,
    value: mapping,
  })) as OptionWithValue<Mapping>[];

  // TODO add support for prefilling builderItems for editing an API mapping
  const [builderItems, setBuilderItems] = React.useState<IMappingBuilderItem[]>([
    { source: null, target: null },
  ]);

  const populateMappingBuilder = (mapping?: Mapping) => {
    const newBuilderItems: IMappingBuilderItem[] = !mapping
      ? []
      : getBuilderItemsFromMapping(mapping, mappingResourceQueries.availableSources);
    // TODO add more items for unmapped sources if necessary
    setBuilderItems(newBuilderItems);
  };

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
                  setIsCreateMappingSelected(true);
                  setSelectedExistingMapping(null);
                  populateMappingBuilder();
                } else {
                  setIsCreateMappingSelected(false);
                  setSelectedExistingMapping(sel.value as Mapping);
                  populateMappingBuilder(sel.value as Mapping);
                }
                setIsMappingSelectOpen(false);
              }}
              selections={
                isCreateMappingSelected
                  ? [newMappingOption]
                  : selectedExistingMapping
                  ? [mappingOptions.find((option) => option.value === selectedExistingMapping)]
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

        {(isCreateMappingSelected || selectedExistingMapping) && (
          <>
            <MappingBuilder
              mappingType={mappingType}
              availableSources={mappingResourceQueries.availableSources}
              availableTargets={mappingResourceQueries.availableTargets}
              builderItems={builderItems}
              setBuilderItems={setBuilderItems}
            />
            <Checkbox
              label="Save mapping to use again"
              aria-label="save mapping checkbox"
              id="save-mapping-check"
              isChecked={form.values.isSaveNewMapping}
              onChange={() => form.fields.isSaveNewMapping.setValue(!form.values.isSaveNewMapping)}
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
        )}
      </Flex>
    </Form>
  );
};

export default MappingForm;
