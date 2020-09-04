import * as React from 'react';
import {
  Checkbox,
  Radio,
  TextContent,
  Text,
  TextInput,
  TextVariants,
  FormGroup,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { IStorageMapping } from '@app/Mappings/types';
import AddEditStorageMapping from '@app/Mappings/Storage/components/AddEditStorageMapping';

interface IStorageMappingProps {
  storageMappingList: IStorageMapping[];
}

const StorageMapping: React.FunctionComponent<IStorageMappingProps> = ({
  storageMappingList,
}: IStorageMappingProps) => {
  const storageMappingOptions = Object.values(storageMappingList).map((storageMapping) => ({
    toString: () => storageMapping.name,
    value: storageMapping,
  })) as OptionWithValue<IStorageMapping>[];

  const [isUseExistingMappingChecked, toggleUseExistingMapping] = React.useReducer(
    (isUseExistingMappingChecked) => !isUseExistingMappingChecked,
    true
  );

  const [isUseNewMappingChecked, toggleUseNewMapping] = React.useReducer(
    (isUseNewMappingChecked) => !isUseNewMappingChecked,
    false
  );

  const [isSaveNewStorageMapping, toggleSaveNewStorageMapping] = React.useReducer(
    (isSaveNewStorageMapping) => !isSaveNewStorageMapping,
    false
  );

  const [storageMapping, setStorageMapping] = React.useState<IStorageMapping | null>(null);
  const [addStorageMappingName, setAddStorageMappingName] = React.useState<string>('');

  const onChange = () => {
    toggleUseNewMapping();
    toggleUseExistingMapping();
  };

  return (
    <>
      <TextContent className={spacing.mbMd}>
        <Text component={TextVariants.h4}>
          Select an existing storage mapping between your source and target providers, or create a
          new one.
        </Text>
      </TextContent>
      <Radio
        id="existing-mapping"
        label="Use an existing storage mapping"
        name="radio-existing"
        onChange={onChange}
        isChecked={isUseExistingMappingChecked}
      />
      {isUseExistingMappingChecked && (
        <FormGroup
          isRequired
          fieldId="sourceProvider"
          helperTextInvalid="TODO"
          validated="default" // TODO add state/validation/errors to this and other FormGroups
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
      )}
      <Radio
        id="create-mapping"
        label="Create a new storage mapping"
        name="radio-new"
        onChange={onChange}
        isChecked={isUseNewMappingChecked}
      />
      {isUseNewMappingChecked && (
        <>
          <AddEditStorageMapping isEdit={false}></AddEditStorageMapping>
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
              validated="default" // TODO add state/validation/errors to this and other FormGroups
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
    </>
  );
};

export default StorageMapping;
