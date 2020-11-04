import {
  MappingSource,
  Mapping,
  MappingItem,
  MappingType,
  IVMwareProvider,
  IOpenShiftProvider,
  INetworkMappingItem,
  IStorageMappingItem,
  MappingTarget,
  ICommonMapping,
  INetworkMapping,
  IStorageMapping,
  IVMwareVM,
} from '@app/queries/types';
import { IMappingBuilderItem } from './MappingBuilder';
import { getMappingSourceById, getMappingTargetByRef } from '../helpers';
import { CLUSTER_API_VERSION, VIRT_META } from '@app/common/constants';
import { nameAndNamespace } from '@app/queries/helpers';
import { filterSourcesBySelectedVMs } from '@app/Plans/components/Wizard/helpers';
import { IMappingResourcesResult } from '@app/queries';

export const getBuilderItemsFromMappingItems = (
  items: MappingItem[] | null,
  mappingType: MappingType,
  allSources: MappingSource[],
  allTargets: MappingTarget[]
): IMappingBuilderItem[] =>
  items
    ? (items
        .map((item: MappingItem): IMappingBuilderItem | null => {
          const source = getMappingSourceById(allSources, item.source.id);
          const target = getMappingTargetByRef(allTargets, item.destination, mappingType);
          if (source) {
            return { source, target, highlight: false };
          }
          return null;
        })
        .filter((builderItem) => !!builderItem) as IMappingBuilderItem[])
    : [];

export const getBuilderItemsFromMapping = (
  mapping: Mapping,
  mappingType: MappingType,
  allSources: MappingSource[],
  allTargets: MappingTarget[]
): IMappingBuilderItem[] =>
  getBuilderItemsFromMappingItems(
    mapping.spec.map as MappingItem[],
    mappingType,
    allSources,
    allTargets
  );

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
            destination:
              builderItem.target.selfLink === 'pod'
                ? { type: 'pod' }
                : {
                    name: builderItem.target.name,
                    namespace: builderItem.target.namespace,
                    type: 'multus',
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
  const commonMapping: ICommonMapping = {
    apiVersion: CLUSTER_API_VERSION,
    kind: mappingType === MappingType.Network ? 'NetworkMap' : 'StorageMap',
    metadata: {
      name: mappingName,
      namespace: VIRT_META.namespace,
    },
    spec: {
      provider: {
        source: nameAndNamespace(sourceProvider),
        destination: nameAndNamespace(targetProvider),
      },
    },
  };
  if (mappingType === MappingType.Network) {
    const mapping: INetworkMapping = {
      ...commonMapping,
      spec: {
        ...commonMapping.spec,
        map: items as INetworkMappingItem[],
      },
    };
    return mapping;
  }
  const mapping: IStorageMapping = {
    ...commonMapping,
    spec: {
      ...commonMapping.spec,
      map: items as IStorageMappingItem[],
    },
  };
  return mapping;
};

export const getBuilderItemsWithMissingSources = (
  builderItems: IMappingBuilderItem[],
  mappingResourceQueries: IMappingResourcesResult,
  selectedVMs: IVMwareVM[],
  mappingType: MappingType
): IMappingBuilderItem[] => {
  const requiredSources = filterSourcesBySelectedVMs(
    mappingResourceQueries.availableSources,
    selectedVMs,
    mappingType
  );
  const missingSources = requiredSources.filter(
    (source) => !builderItems.some((item) => item.source?.selfLink === source.selfLink)
  );
  return [
    ...builderItems,
    ...missingSources.map(
      (source): IMappingBuilderItem => ({
        source,
        target: null,
        highlight: builderItems.length > 0,
      })
    ),
  ];
};
