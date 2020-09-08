import * as React from 'react';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { ICNVNetwork } from '@app/Providers/types';
import { MappingTarget, MappingType } from '@app/Mappings/types';
import { IMappingBuilderItem } from './MappingBuilder';

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
    toString: () => {
      if (mappingType === MappingType.Network) {
        return (target as ICNVNetwork).name;
      }
      if (mappingType === MappingType.Storage) {
        return target as string;
      }
      return '';
    },
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
