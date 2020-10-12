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

import './MappingForm.css';

interface IMappingFormProps {
  form: PlanWizardFormState['storageMapping'] | PlanWizardFormState['networkMapping'];
  sourceProvider: IVMwareProvider | null;
  targetProvider: IOpenShiftProvider | null;
  mappingType: MappingType;
  mappingList: Mapping[];
}

const MappingForm: React.FunctionComponent<IMappingFormProps> = ({
  form,
  sourceProvider,
  targetProvider,
  mappingType,
  mappingList,
}: IMappingFormProps) => {
  const mappingResourceQueries = useMappingResourceQueries(
    sourceProvider,
    targetProvider,
    mappingType
  );

  const [isMappingSelectOpen, setIsMappingSelectOpen] = React.useState(false);

  const newMappingOption = {
    toString: () => `Create a new ${mappingType.toLowerCase()} mapping`,
    value: 'new',
  };

  const [isCreateMappingSelected, setIsCreateMappingSelected] = React.useState(false);
  const [selectedExistingMapping, setSelectedExistingMapping] = React.useState<Mapping | null>(
    null
  );

  const mappingOptions = Object.values(mappingList).map((mapping) => ({
    toString: () => mapping.name,
    value: mapping,
  })) as OptionWithValue<Mapping>[];

  // TODO add support for prefilling builderItems for editing an API mapping
  const [builderItems, setBuilderItems] = React.useState<IMappingBuilderItem[]>([
    { source: null, target: null },
  ]);

  const populateMappingBuilder = (mapping?: Mapping) => {};

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
              <SelectGroup label="Existing mappings">
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
