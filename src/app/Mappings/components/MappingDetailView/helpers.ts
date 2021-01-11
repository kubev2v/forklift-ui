import {
  IAnnotatedStorageClass,
  INetworkMappingItem,
  IOpenShiftNetwork,
  IStorageClass,
  IStorageMappingItem,
  MappingItem,
  MappingTarget,
  MappingType,
  POD_NETWORK,
} from '@app/queries/types';

export const getMappingItemTargetName = (item: MappingItem, mappingType: MappingType): string => {
  if (mappingType === MappingType.Network) {
    const networkItem = item as INetworkMappingItem;
    if (networkItem.destination.type === 'pod') return POD_NETWORK.name;
    return `${networkItem.destination.namespace} / ${networkItem.destination.name}`;
  }
  return (item as IStorageMappingItem).destination.storageClass;
};

export const groupMappingItemsByTarget = (
  mappingItems: MappingItem[],
  mappingType: MappingType
): MappingItem[][] => {
  const targetNames: string[] = Array.from(
    new Set(mappingItems.map((item) => getMappingItemTargetName(item, mappingType)))
  );
  return targetNames.map((targetName) =>
    mappingItems.filter((item) => getMappingItemTargetName(item, mappingType) === targetName)
  );
};

export const getMappingTargetName = (target: MappingTarget, mappingType: MappingType): string => {
  if (mappingType === MappingType.Network) {
    const network = target as IOpenShiftNetwork | typeof POD_NETWORK;
    if ((network as typeof POD_NETWORK).type === 'pod') return POD_NETWORK.name;
    return `${network.namespace} / ${network.name}`;
  }
  return (target as IAnnotatedStorageClass).name;
};
