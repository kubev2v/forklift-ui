import { MappingSource, Mapping, MappingItem, MappingType, MappingTarget } from '../../types';
import { IMappingBuilderGroup } from './MappingBuilder';
import { IVMwareProvider, ICNVProvider } from '@app/Providers/types';

export const getSourceById = (sources: MappingSource[], id: string): MappingSource | undefined =>
  sources.find((source) => source.id === id);

export const getBuilderGroupsFromMapping = (
  mapping: Mapping,
  allSources: MappingSource[]
): IMappingBuilderGroup[] => {
  const groups: IMappingBuilderGroup[] = [];
  mapping.items.forEach((item: MappingItem) => {
    const group = groups.find((g) => g.target === item.target);
    const source = getSourceById(allSources, item.source.id);
    if (group) {
      if (source) group.sources.push(source);
    } else {
      groups.push({ sources: source ? [source] : [], target: item.target });
    }
  });
  return groups;
};

interface IGetMappingParams {
  mappingType: MappingType;
  mappingName: string;
  sourceProvider: IVMwareProvider;
  targetProvider: ICNVProvider;
  mappingGroups: IMappingBuilderGroup[];
}

export const getMappingFromBuilderGroups = ({
  mappingType,
  mappingName,
  sourceProvider,
  targetProvider,
  mappingGroups,
}: IGetMappingParams): Mapping => {
  const items: MappingItem[] = [];
  mappingGroups.forEach((group) => {
    if (group.target) {
      group.sources.forEach((source) =>
        items.push({
          source: { id: source.id },
          target: group.target as MappingTarget,
        } as MappingItem)
      );
    }
  });
  return {
    type: mappingType,
    name: mappingName,
    provider: {
      source: {
        type: sourceProvider.spec.type,
        name: sourceProvider.metadata.name,
      },
      target: {
        type: targetProvider.spec.type,
        name: targetProvider.metadata.name,
      },
    },
    items,
  } as Mapping;
};
