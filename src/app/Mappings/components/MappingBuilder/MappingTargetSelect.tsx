import * as React from 'react';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { MappingTarget, MappingType } from '@app/queries/types';
import { IMappingBuilderItem } from './MappingBuilder';
import { getMappingTargetName } from '../helpers';

interface IMappingTargetSelectProps {
  id: string;
  mappingType: MappingType;
  builderItems: IMappingBuilderItem[];
  itemIndex: number;
  setBuilderItems: (items: IMappingBuilderItem[]) => void;
  availableTargets: MappingTarget[];
  placeholderText: string;
}

const MappingTargetSelect: React.FunctionComponent<IMappingTargetSelectProps> = ({
  id,
  mappingType,
  builderItems,
  itemIndex,
  setBuilderItems,
  availableTargets,
  placeholderText,
}: IMappingTargetSelectProps) => {
  const setTarget = (target: MappingTarget) => {
    const newItems = [...builderItems];
    newItems[itemIndex] = { ...builderItems[itemIndex], target };
    setBuilderItems(newItems);
  };

  const targetOptions: OptionWithValue<MappingTarget>[] = availableTargets.map((target) => ({
    value: target,
    toString: () => getMappingTargetName(target, mappingType),
  }));
  const selectedOption = targetOptions.find(
    (option: OptionWithValue<MappingTarget>) => option.value === builderItems[itemIndex].target
  );

  return (
    <SimpleSelect
      id={id}
      className="mapping-item-select"
      variant="typeahead"
      isPlain
      options={targetOptions}
      value={[selectedOption]}
      onChange={(selection) => {
        setTarget((selection as OptionWithValue<MappingTarget>).value);
      }}
      placeholderText={placeholderText}
    />
  );
};

export default MappingTargetSelect;
