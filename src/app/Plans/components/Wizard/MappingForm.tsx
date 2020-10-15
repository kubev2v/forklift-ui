import * as React from 'react';
import {
  Checkbox,
  Grid,
  GridItem,
  Radio,
  TextContent,
  Text,
  Form,
  FormGroup,
  Flex,
  FlexItem,
  Alert,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ValidatedTextInput } from '@konveyor/lib-ui';

import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { MappingType, Mapping, IVMwareProvider, IOpenShiftProvider } from '@app/queries/types';
import { MappingBuilder, IMappingBuilderItem } from '@app/Mappings/components/MappingBuilder';
import { useMappingResourceQueries } from '@app/queries';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import { PlanWizardFormState } from './PlanWizard';

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

  const mappingOptions = Object.values(mappingList).map((mapping) => ({
    toString: () => mapping.name,
    value: mapping,
  })) as OptionWithValue<Mapping>[];

  const [isCreateMappingChecked, toggleCreateMapping] = React.useReducer(
    (isCreateMappingChecked) => !isCreateMappingChecked,
    false
  );

  // TODO add support for prefilling builderItems for editing an API mapping
  const [builderItems, setBuilderItems] = React.useState<IMappingBuilderItem[]>([
    { source: null, target: null },
  ]);

  return (
    <Form>
      <TextContent>
        <Text component="p">
          Select an existing {mappingType.toLowerCase()} mapping between your source and target
          providers, or create a new one.
        </Text>
      </TextContent>
      <Flex direction={{ default: 'column' }} className={spacing.mbMd}>
        <Radio
          id="existing-mapping"
          label={`Use an existing ${mappingType.toLowerCase()} mapping`}
          name="radio-existing"
          onChange={toggleCreateMapping}
          isChecked={!isCreateMappingChecked}
        />
        {!isCreateMappingChecked && (
          <FlexItem>
            <FormGroup isRequired fieldId="mappingSelect">
              <SimpleSelect
                id="mappingSelect"
                aria-label="Select mapping"
                options={mappingOptions}
                value={[mappingOptions.find((option) => option.value === form.values.mapping)]}
                onChange={(selection) =>
                  form.fields.mapping.setValue((selection as OptionWithValue<Mapping>).value)
                }
                placeholderText={`Select a ${mappingType.toLowerCase()} mapping`}
              />
            </FormGroup>
          </FlexItem>
        )}
        <Radio
          id="create-mapping"
          label={`Create a new ${mappingType.toLowerCase()} mapping`}
          name="radio-new"
          onChange={toggleCreateMapping}
          isChecked={isCreateMappingChecked}
        />
        {isCreateMappingChecked && (
          <>
            {mappingResourceQueries.isLoading ? (
              <LoadingEmptyState />
            ) : mappingResourceQueries.isError ? (
              <Alert variant="danger" isInline title="Error loading mapping resources" />
            ) : (
              // TODO the result of the MappingBuilder is not currently saved to form state. When in this mode we need to sync it with form.fields.mapping
              <MappingBuilder
                mappingType={mappingType}
                availableSources={mappingResourceQueries.availableSources}
                availableTargets={mappingResourceQueries.availableTargets}
                builderItems={builderItems}
                setBuilderItems={setBuilderItems}
              />
            )}
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
