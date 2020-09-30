import * as React from 'react';
import {
  Checkbox,
  Grid,
  GridItem,
  Radio,
  TextInput,
  Title,
  Form,
  FormGroup,
  Flex,
  FlexItem,
  Alert,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { MappingType, Mapping } from '@app/queries/types';
import { MappingBuilder, IMappingBuilderItem } from '@app/Mappings/components/MappingBuilder';
import { useMappingResourceQueries, useProvidersQuery } from '@app/queries';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';

interface IMappingFormProps {
  mappingType: MappingType;
  mappingList: Mapping[];
}

const MappingForm: React.FunctionComponent<IMappingFormProps> = ({
  mappingType,
  mappingList,
}: IMappingFormProps) => {
  ////// TODO remove this and instead use sourceProvider and targetProvider from GeneralForm when we lift that state
  const providersQuery = useProvidersQuery();
  /////////////// ^
  const mappingResourceQueries = useMappingResourceQueries(
    providersQuery.data?.vsphere[0] || null, // TODO use sourceProvider form value from GeneralForm
    providersQuery.data?.openshift[0] || null, // TODO use targetProvider form value from GeneralForm
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

  const [isSaveNewMapping, toggleSaveNewMapping] = React.useReducer(
    (isSaveNewMapping) => !isSaveNewMapping,
    false
  );

  const [mapping, setMapping] = React.useState<Mapping | null>(null);
  const [mappingName, setMappingName] = React.useState<string>('');

  // TODO add support for prefilling builderItems for editing an API mapping
  const [builderItems, setBuilderItems] = React.useState<IMappingBuilderItem[]>([
    { source: null, target: null },
  ]);

  // TODO add to disable Next step
  const isEveryItemFilled = () => builderItems.every((item) => item.source && item.target);

  return (
    <Form>
      <Title headingLevel="h3" size="md">
        Select an existing {mappingType.toLowerCase} mapping between your source and target
        providers, or create a new one.
      </Title>
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
            <FormGroup
              isRequired
              fieldId="sourceProvider"
              helperTextInvalid="TODO"
              // TODO add state/validation/errors to this and other FormGroups
              validated="default"
            >
              <SimpleSelect
                id="mappingSelect"
                options={mappingOptions}
                value={[mappingOptions.find((option) => option.value === mapping)]}
                onChange={(selection) => setMapping((selection as OptionWithValue<Mapping>).value)}
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
              <Alert variant="danger" title="Error loading mapping resources" />
            ) : (
              <MappingBuilder
                mappingType={mappingType}
                availableSources={mappingResourceQueries.availableSources}
                availableTargets={mappingResourceQueries.availableTargets}
                builderItems={builderItems}
                setBuilderItems={setBuilderItems}
                isEveryItemFilled={isEveryItemFilled}
              />
            )}
            <Checkbox
              label="Save mapping to use again"
              aria-label="save mapping checkbox"
              id="save-mapping-check"
              isChecked={isSaveNewMapping}
              onChange={toggleSaveNewMapping}
            />
            {isSaveNewMapping && (
              <Grid className={spacing.mbMd}>
                <GridItem sm={12} md={5} className={spacing.mbMd}>
                  <FormGroup
                    isRequired
                    label="Name"
                    fieldId="mapping-name"
                    helperTextInvalid="TODO"
                    // TODO add state/validation/errors to this and other FormGroups
                    validated="default"
                  >
                    <TextInput
                      id="mapping-name"
                      value={mappingName}
                      type="text"
                      onChange={setMappingName}
                    />
                  </FormGroup>
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
