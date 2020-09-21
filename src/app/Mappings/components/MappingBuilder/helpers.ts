import {
  MappingSource,
  Mapping,
  MappingItem,
  MappingType,
  MappingTarget,
  IVMwareProvider,
  IOpenShiftProvider,
} from '@app/queries/types';
import { IMappingBuilderItem } from './MappingBuilder';
import { getMappingSourceById } from '../helpers';

export const getBuilderItemsFromMapping = (
  mapping: Mapping,
  allSources: MappingSource[]
): IMappingBuilderItem[] =>
  (mapping.items as MappingItem[])
    .map((item: MappingItem) => {
      const source = getMappingSourceById(allSources, item.source.id);
      if (source) {
        return { source, target: item.target } as IMappingBuilderItem;
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
    .map((item) => {
      if (item.source && item.target) {
        return {
          source: { id: item.source.id },
          target: item.target as MappingTarget,
        };
      }
      return null;
    })
    .filter((item) => !!item) as MappingItem[];
  return {
    type: mappingType,
    name: mappingName,
    provider: {
      source: {
        type: sourceProvider.type,
        name: sourceProvider.name,
      },
      target: {
        type: targetProvider.type,
        name: targetProvider.name,
      },
    },
    items,
  } as Mapping;
};
