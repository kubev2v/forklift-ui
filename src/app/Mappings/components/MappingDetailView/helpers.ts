import { INetworkMappingItem, IStorageMappingItem, MappingType } from '@app/Mappings/types';
import { ICNVNetwork } from '@app/Providers/types';
import { getMappingTargetName } from '../helpers';

export const groupMappingItemsByTarget = (
  mappingItems: (IStorageMappingItem | INetworkMappingItem)[],
  mappingType: MappingType
): (IStorageMappingItem | INetworkMappingItem)[][] => {
  const targetNames: (ICNVNetwork | string)[] = Array.from(
    new Set(mappingItems.map((item) => getMappingTargetName(item.target, mappingType)))
  );
  return targetNames.map((targetName) =>
    mappingItems.filter((item) => getMappingTargetName(item.target, mappingType) === targetName)
  );
};
