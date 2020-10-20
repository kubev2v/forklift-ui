import {
  MappingSource,
  Mapping,
  MappingItem,
  MappingType,
  IVMwareProvider,
  IOpenShiftProvider,
  INetworkMapping,
  IStorageMapping,
  INetworkMappingItem,
  IStorageMappingItem,
  MappingTarget,
} from '@app/queries/types';
import { IMappingBuilderItem } from './MappingBuilder';
import { getMappingSourceById, getMappingTargetByRef } from '../helpers';
import { VIRT_META } from '@app/common/constants';
import { nameAndNamespace } from '@app/queries/helpers';

export const getMappingItems = (mapping: Mapping, mappingType: MappingType): MappingItem[] =>
  mappingType === MappingType.Network
    ? (mapping as INetworkMapping).networks
    : (mapping as IStorageMapping).datastores;

export const getBuilderItemsFromMapping = (
  mapping: Mapping,
  mappingType: MappingType,
  allSources: MappingSource[],
  allTargets: MappingTarget[]
): IMappingBuilderItem[] =>
  getMappingItems(mapping, mappingType)
    .map((item: MappingItem): IMappingBuilderItem | null => {
      const source = getMappingSourceById(allSources, item.source.id);
      const target = getMappingTargetByRef(allTargets, item.destination, mappingType);
      if (source) {
        return { source, target, highlight: false }; // TODO we need a lookup....
      }
      return null;
    })
    .filter((builderItem) => !!builderItem) as IMappingBuilderItem[];
interface IGetMappingParams {
  mappingType: MappingType;
  mappingName: string;
  sourceProvider: IVMwareProvider;
  targetProvider: IOpenShiftProvider;
  builderItems: IMappingBuilderItem[];
}

export const getMappingFromBuilderItems = ({
  mappingType,
  mappingName,
  sourceProvider,
  targetProvider,
  builderItems,
}: IGetMappingParams): Mapping => {
  const items: MappingItem[] = builderItems
    .map((builderItem): MappingItem | null => {
      if (builderItem.source && builderItem.target) {
        if (mappingType === MappingType.Network) {
          const item: INetworkMappingItem = {
            source: { id: builderItem.source.id },
            destination: {
              name: builderItem.target.name,
              namespace: builderItem.target.namespace,
              type: 'pod', // TODO don't hard-code the type here? where do we get that?
            },
          };
          return item;
        }
        if (mappingType === MappingType.Storage) {
          const item: IStorageMappingItem = {
            source: { id: builderItem.source.id },
            destination: {
              storageClass: builderItem.target.name,
            },
          };
          return item;
        }
      }
      return null;
    })
    .filter((item) => !!item) as MappingItem[];
  return {
    metadata: {
      name: mappingName,
      namespace: VIRT_META.namespace,
    },
    provider: {
      source: nameAndNamespace(sourceProvider),
      destination: nameAndNamespace(targetProvider),
    },
    ...(mappingType === MappingType.Network
      ? { networks: items as INetworkMappingItem[] }
      : { datastores: items as IStorageMappingItem[] }),
  };
};
