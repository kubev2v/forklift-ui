import { MappingType, INetworkMappingItem, IStorageMappingItem } from '@app/Mappings/types';
import { MappingTarget } from '../../types';

// TODO this will be useful for converting/flattening
/*
export const getMappingTargets = (
  mappingType: MappingType,
  mappingItems: (INetworkMappingItem | IStorageMappingItem)[]
): MappingTarget[] => {
  if (mappingType === MappingType.Network) {
    return Array.from(new Set((mappingItems as INetworkMappingItem[]).map((item) => item.target)));
  }
  if (mappingType === MappingType.Storage) {
    return Array.from(new Set((mappingItems as IStorageMappingItem[]).map((item) => item.target)));
  }
  return [];
};
*/
