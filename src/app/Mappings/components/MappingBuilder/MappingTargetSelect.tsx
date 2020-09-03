import * as React from 'react';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { ICNVNetwork } from '@app/Providers/types';
import { MappingTarget, MappingType } from '@app/Mappings/types';
import { IMappingBuilderGroup } from './MappingBuilder';

interface IMappingTargetSelectProps {
  id: string;
  mappingType: MappingType;
  mappingGroups: IMappingBuilderGroup[];
  groupIndex: number;
  setMappingGroups: (groups: IMappingBuilderGroup[]) => void;
  availableTargets: MappingTarget[];
  placeholderText: string;
}

const MappingTargetSelect: React.FunctionComponent<IMappingTargetSelectProps> = ({
  id,
  mappingType,
  mappingGroups,
  groupIndex,
  setMappingGroups,
  availableTargets,
  placeholderText,
}: IMappingTargetSelectProps) => {
  const setTarget = (target: MappingTarget) => {
    const newGroups = [...mappingGroups];
    newGroups[groupIndex] = { ...mappingGroups[groupIndex], target };
    setMappingGroups(newGroups);
  };

  // Don't allow selection of targets already selected in other groups
  const filteredTargets = availableTargets.filter(
    (target) =>
      !mappingGroups.some((group, index) => group.target === target && index !== groupIndex)
  );
  const targetOptions: OptionWithValue<MappingTarget>[] = filteredTargets.map((target) => ({
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
    (option: OptionWithValue<MappingTarget>) => option.value === mappingGroups[groupIndex].target
  );

  return (
    <SimpleSelect
      id={id}
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
