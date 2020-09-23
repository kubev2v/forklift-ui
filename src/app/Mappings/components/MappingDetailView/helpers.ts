import { MappingItem } from '@app/queries/types';

export const groupMappingItemsByTarget = (mappingItems: MappingItem[]): MappingItem[][] => {
  const targetNames: string[] = Array.from(new Set(mappingItems.map((item) => item.target.name)));
  return targetNames.map((targetName) =>
    mappingItems.filter((item) => item.target.name === targetName)
  );
};
