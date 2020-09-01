import * as React from 'react';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { ICNVProvider, ICNVNetwork, ICNVStorageClass } from '@app/Providers/types';
import {
  INetworkMappingItem,
  IStorageMappingItem,
  MappingItemTarget,
  MappingType,
} from '@app/Mappings/types';

interface IMappingTargetSelectProps {
  id: string;
  mappingType: MappingType;
  targetProvider: ICNVProvider;
  mappingItems: (INetworkMappingItem | IStorageMappingItem)[];
  availableTargets: (ICNVNetwork | ICNVStorageClass)[];
  target: MappingItemTarget;
  updateMappingTarget: (oldTarget: MappingItemTarget, newTarget: MappingItemTarget) => void;
  placeholderText: string;
}

const MappingTargetSelect: React.FunctionComponent<IMappingTargetSelectProps> = ({
  id,
  mappingType,
  targetProvider,
  mappingItems,
  availableTargets,
  target,
  updateMappingTarget,
  placeholderText,
}: IMappingTargetSelectProps) => {
  // Don't allow selection of targets already selected
  const filteredTargets = availableTargets.filter(
    (t) => !mappingItems.some((item) => item.target !== target && item.target === t)
  );
  const targetOptions: OptionWithValue<ICNVNetwork | ICNVStorageClass>[] = filteredTargets.map(
    (target) => ({
      value: target,
      toString: () => {
        if (mappingType === MappingType.Network) {
          return `${targetProvider.metadata.name} / ${(target as ICNVNetwork).name}`;
        }
        if (mappingType === MappingType.Storage) {
          return `${targetProvider.metadata.name} / ${(target as ICNVStorageClass).storageClass}`;
        }
        return '';
      },
    })
  );

  return (
    <SimpleSelect
      id={id}
      isPlain
      options={targetOptions}
      value={[
        targetOptions.find(
          (option: OptionWithValue<ICNVNetwork | ICNVStorageClass>) => option.value === target
        ),
      ]}
      onChange={(selection) => {
        updateMappingTarget(
          target,
          (selection as OptionWithValue<ICNVNetwork | ICNVStorageClass>).value
        );
      }}
      placeholderText={placeholderText}
    />
  );
};

export default MappingTargetSelect;
