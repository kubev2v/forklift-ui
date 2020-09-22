import {
  IOpenShiftNetwork,
  IStorageClass,
  MappingItem,
  MappingSource,
  MappingTarget,
  MappingType,
} from '@app/queries/types';

export const getMappingSourceById = (
  sources: MappingSource[],
  id: string
): MappingSource | undefined => sources.find((source) => source.id === id);

export const getMappingSourceTitle = (mappingType: MappingType): string => {
  if (mappingType === MappingType.Network) {
    return 'Source networks';
  }
  if (mappingType === MappingType.Storage) {
    return 'Source datastores';
  }
  return '';
};

export const getMappingTargetTitle = (mappingType: MappingType): string => {
  if (mappingType === MappingType.Network) {
    return 'Target networks';
  }
  if (mappingType === MappingType.Storage) {
    return 'Target storage classes';
  }
  return '';
};

export const getMappingItemTargetName = (
  target: MappingItem['target'],
  mappingType: MappingType,
  availableTargets: MappingTarget[]
): string => {
  if (mappingType === MappingType.Network) {
    return (target as IOpenShiftNetwork).name;
  }
  if (mappingType === MappingType.Storage) {
    return (
      (availableTargets as IStorageClass[]).find(
        (storageClass) => storageClass.name === (target as string)
      )?.name || ''
    );
  }
  return '';
};
