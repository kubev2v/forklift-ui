import {
  INetworkMappingItem,
  IStorageMappingItem,
  MappingSource,
  MappingTarget,
  MappingType,
} from '@app/queries/types';

export const getMappingSourceById = (sources: MappingSource[], id: string): MappingSource | null =>
  sources.find((source) => source.id === id) || null;

export const getMappingTargetByRef = (
  targets: MappingTarget[],
  ref: INetworkMappingItem['destination'] | IStorageMappingItem['destination'],
  mappingType: MappingType
): MappingTarget | null =>
  targets.find((target) => {
    if (mappingType === MappingType.Network) {
      const networkRef = ref as INetworkMappingItem['destination'];
      if (networkRef.type === 'pod') {
        return target.selfLink === 'pod';
      }
      return target.name === networkRef.name && target.namespace === networkRef.namespace;
    }
    if (mappingType === MappingType.Storage) {
      const storageRef = ref as IStorageMappingItem['destination'];
      return target.name === storageRef.storageClass;
    }
    return null;
  }) || null;

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
