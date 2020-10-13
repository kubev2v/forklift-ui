import * as React from 'react';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { MappingTarget } from '@app/queries/types';
import { IMappingBuilderItem } from './MappingBuilder';

interface IMappingTargetSelectProps {
  id: string;
  builderItems: IMappingBuilderItem[];
  itemIndex: number;
  setBuilderItems: (items: IMappingBuilderItem[]) => void;
  availableTargets: MappingTarget[];
}

const MappingTargetSelect: React.FunctionComponent<IMappingTargetSelectProps> = ({
  id,
  builderItems,
  itemIndex,
  setBuilderItems,
  availableTargets,
}: IMappingTargetSelectProps) => {
  const setTarget = (target: MappingTarget) => {
    const newItems = [...builderItems];
    newItems[itemIndex] = { ...builderItems[itemIndex], target, highlight: false };
    setBuilderItems(newItems);
  };

  const targetOptions: OptionWithValue<MappingTarget>[] = availableTargets.map((target) => ({
    value: target,
    toString: () => target.name,
  }));
  const selectedOption = targetOptions.find(
    (option: OptionWithValue<MappingTarget>) =>
      option.value.selfLink === builderItems[itemIndex].target?.selfLink
  );

  return (
    <SimpleSelect
      id={id}
      aria-label="Select target"
      className="mapping-item-select"
      variant="typeahead"
      isPlain
      options={targetOptions}
      value={[selectedOption]}
      onChange={(selection) => {
        setTarget((selection as OptionWithValue<MappingTarget>).value);
      }}
      typeAheadAriaLabel="Select target..."
      placeholderText="Select target..."
    />
  );
};

export default MappingTargetSelect;
