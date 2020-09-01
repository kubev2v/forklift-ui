import { MappingType, INetworkMappingItem, IStorageMappingItem } from '@app/Mappings/types';
import { MappingItemTarget } from '../../types';

export const getMappingTargets = (
  mappingType: MappingType,
  mappingItems: (INetworkMappingItem | IStorageMappingItem)[]
): MappingItemTarget[] => {
  if (mappingType === MappingType.Network) {
    return Array.from(new Set((mappingItems as INetworkMappingItem[]).map((item) => item.target)));
  }
  if (mappingType === MappingType.Storage) {
    return Array.from(new Set((mappingItems as IStorageMappingItem[]).map((item) => item.target)));
  }
  return [];
};
