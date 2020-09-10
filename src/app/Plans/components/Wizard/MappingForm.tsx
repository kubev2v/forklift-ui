import * as React from 'react';
import {
  Checkbox,
  Radio,
  TextInput,
  Title,
  Form,
  FormGroup,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { IStorageMapping, MappingType, INetworkMapping } from '@app/Mappings/types';
import { MappingBuilder, IMappingBuilderItem } from '@app/Mappings/components/MappingBuilder';
import { MappingSource, MappingTarget } from '@app/Mappings/types';

interface IMappingFormProps {
  mappingType: MappingType;
  mappingList: IStorageMapping[] | INetworkMapping[];
  availableSources?: MappingSource[];
  availableTargets?: MappingTarget[];
}

const MappingForm: React.FunctionComponent<IMappingFormProps> = ({
  mappingType,
  mappingList,
  availableSources = [],
  availableTargets = [],
}: IMappingFormProps) => {
  const mappingOptions = Object.values(mappingList).map((mapping) => ({
    toString: () => mapping.name,
    value: mapping,
  })) as OptionWithValue<IStorageMapping | INetworkMapping>[];

  const [isCreateMappingChecked, toggleCreateMapping] = React.useReducer(
    (isCreateMappingChecked) => !isCreateMappingChecked,
    false
  );

  const [isSaveNewMapping, toggleSaveNewMapping] = React.useReducer(
    (isSaveNewMapping) => !isSaveNewMapping,
    false
  );

  const [mapping, setMapping] = React.useState<IStorageMapping | INetworkMapping | null>(null);
  const [addMappingName, setAddMappingName] = React.useState<string>('');

  // TODO add support for prefilling builderItems for editing an API mapping
  const [builderItems, setBuilderItems] = React.useState<IMappingBuilderItem[]>([
    { source: null, target: null },
  ]);

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
                onChange={(selection) =>
                  setMapping((selection as OptionWithValue<IStorageMapping>).value)
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
            <MappingBuilder
              mappingType={mappingType}
              availableSources={availableSources}
              availableTargets={availableTargets}
              builderItems={builderItems}
              setBuilderItems={setBuilderItems}
            />
            <Checkbox
              label="Save mapping to use again"
              aria-label="save mapping checkbox"
              id="save-mapping-check"
              isChecked={isSaveNewMapping}
              onChange={toggleSaveNewMapping}
            />
            {isSaveNewMapping && (
              <FormGroup
                isRequired
                fieldId="mappingName"
                helperTextInvalid="TODO"
                // TODO add state/validation/errors to this and other FormGroups
                validated="default"
              >
                <TextInput
                  id="addMappingName"
                  value={addMappingName}
                  type="text"
                  onChange={setAddMappingName}
                />
              </FormGroup>
            )}
          </>
        )}
      </Flex>
    </Form>
  );
};

export default MappingForm;
