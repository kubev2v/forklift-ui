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
import { INetworkMapping } from '@app/Mappings/types';
import AddEditNetworkMapping from '@app/Mappings/Network/components/AddEditNetworkMapping';

interface INetworkMappingProps {
  networkMappingList: INetworkMapping[];
}

const NetworkMapping: React.FunctionComponent<INetworkMappingProps> = ({
  networkMappingList,
}: INetworkMappingProps) => {
  const networkMappingOptions = Object.values(networkMappingList).map((networkMapping) => ({
    toString: () => networkMapping.name,
    value: networkMapping,
  })) as OptionWithValue<INetworkMapping>[];

  const [isUseExistingMappingChecked, toggleUseExistingMapping] = React.useReducer(
    (isUseExistingMappingChecked) => !isUseExistingMappingChecked,
    true
  );

  const [isUseNewMappingChecked, toggleUseNewMapping] = React.useReducer(
    (isUseNewMappingChecked) => !isUseNewMappingChecked,
    false
  );

  const [isSaveNewNetworkMapping, toggleSaveNewNetworkMapping] = React.useReducer(
    (isSaveNewNetworkMapping) => !isSaveNewNetworkMapping,
    false
  );

  const [networkMapping, setNetworkMapping] = React.useState<INetworkMapping | null>(null);
  const [addNetworkMappingName, setAddNetworkMappingName] = React.useState<string>('');

  const onChange = () => {
    toggleUseNewMapping();
    toggleUseExistingMapping();
  };

  return (
    <>
      <Form>
        <Title headingLevel="h3" size="md">
          Select an existing network mapping between your source and target providers, or create a
          new one.
        </Title>
        <Flex direction={{ default: 'column' }} className={spacing.mbMd}>
          <Radio
            id="existing-mapping"
            label="Use an existing network mapping"
            name="radio-existing"
            onChange={onChange}
            isChecked={isUseExistingMappingChecked}
          />
          {isUseExistingMappingChecked && (
            <FlexItem>
              <FormGroup
                isRequired
                fieldId="sourceProvider"
                helperTextInvalid="TODO"
                validated="default" // TODO add state/validation/errors to this and other FormGroups
              >
                <SimpleSelect
                  id="networkMapping"
                  options={networkMappingOptions}
                  value={[networkMappingOptions.find((option) => option.value === networkMapping)]}
                  onChange={(selection) =>
                    setNetworkMapping((selection as OptionWithValue<INetworkMapping>).value)
                  }
                  placeholderText="Select a network mapping"
                />
              </FormGroup>
            </FlexItem>
          )}
          <Radio
            id="create-mapping"
            label="Create a new network mapping"
            name="radio-new"
            onChange={onChange}
            isChecked={isUseNewMappingChecked}
          />
          {isUseNewMappingChecked && (
            <>
              <AddEditNetworkMapping isEdit={false}></AddEditNetworkMapping>
              <Checkbox
                label="Save mapping to use again"
                aria-label="save mapping checkbox"
                id="save-mapping-check"
                isChecked={isSaveNewNetworkMapping}
                onChange={toggleSaveNewNetworkMapping}
              />
              {isSaveNewNetworkMapping && (
                <FormGroup
                  isRequired
                  fieldId="planName"
                  helperTextInvalid="TODO"
                  validated="default" // TODO add state/validation/errors to this and other FormGroups
                >
                  <TextInput
                    id="addNetworkMappingName"
                    value={addNetworkMappingName}
                    type="text"
                    onChange={setAddNetworkMappingName}
                  />
                </FormGroup>
              )}
            </>
          )}
        </Flex>
      </Form>
    </>
  );
};

export default NetworkMapping;
