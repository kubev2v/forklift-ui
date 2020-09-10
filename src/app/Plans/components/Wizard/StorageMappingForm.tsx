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
import { IStorageMapping, MappingType } from '@app/Mappings/types';
import { MappingBuilder, IMappingBuilderItem } from '@app/Mappings/components/MappingBuilder';
import { MappingSource, MappingTarget } from '@app/Mappings/types';

interface IStorageMappingFormProps {
  storageMappingList: IStorageMapping[];
  availableSources?: MappingSource[];
  availableTargets?: MappingTarget[];
}

const StorageMappingForm: React.FunctionComponent<IStorageMappingFormProps> = ({
  storageMappingList,
  availableSources = [],
  availableTargets = [],
}: IStorageMappingFormProps) => {
  const storageMappingOptions = Object.values(storageMappingList).map((storageMapping) => ({
    toString: () => storageMapping.name,
    value: storageMapping,
  })) as OptionWithValue<IStorageMapping>[];

  const [isCreateMappingChecked, toggleCreateMapping] = React.useReducer(
    (isCreateMappingChecked) => !isCreateMappingChecked,
    false
  );

  const [isSaveNewStorageMapping, toggleSaveNewStorageMapping] = React.useReducer(
    (isSaveNewStorageMapping) => !isSaveNewStorageMapping,
    false
  );

  const [storageMapping, setStorageMapping] = React.useState<IStorageMapping | null>(null);
  const [addStorageMappingName, setAddStorageMappingName] = React.useState<string>('');

  // TODO add support for prefilling builderItems for editing an API mapping
  const [builderItems, setBuilderItems] = React.useState<IMappingBuilderItem[]>([
    { source: null, target: null },
  ]);

  return (
    <Form>
      <Title headingLevel="h3" size="md">
        Select an existing storage mapping between your source and target providers, or create a new
        one.
      </Title>
      <Flex direction={{ default: 'column' }} className={spacing.mbMd}>
        <Radio
          id="existing-mapping"
          label="Use an existing storage mapping"
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
                id="storageMapping"
                options={storageMappingOptions}
                value={[storageMappingOptions.find((option) => option.value === storageMapping)]}
                onChange={(selection) =>
                  setStorageMapping((selection as OptionWithValue<IStorageMapping>).value)
                }
                placeholderText="Select a storage mapping"
              />
            </FormGroup>
          </FlexItem>
        )}
        <Radio
          id="create-mapping"
          label="Create a new storage mapping"
          name="radio-new"
          onChange={toggleCreateMapping}
          isChecked={isCreateMappingChecked}
        />
        {isCreateMappingChecked && (
          <>
            <MappingBuilder
              mappingType={MappingType.Storage}
              availableSources={availableSources}
              availableTargets={availableTargets}
              builderItems={builderItems}
              setBuilderItems={setBuilderItems}
            />
            <Checkbox
              label="Save mapping to use again"
              aria-label="save mapping checkbox"
              id="save-mapping-check"
              isChecked={isSaveNewStorageMapping}
              onChange={toggleSaveNewStorageMapping}
            />
            {isSaveNewStorageMapping && (
              <FormGroup
                isRequired
                fieldId="planName"
                helperTextInvalid="TODO"
                // TODO add state/validation/errors to this and other FormGroups
                validated="default"
              >
                <TextInput
                  id="addStorageMappingName"
                  value={addStorageMappingName}
                  type="text"
                  onChange={setAddStorageMappingName}
                />
              </FormGroup>
            )}
          </>
        )}
      </Flex>
    </Form>
  );
};

export default StorageMappingForm;
