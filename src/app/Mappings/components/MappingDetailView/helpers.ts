import { MappingItem, MappingType } from '@app/queries/types';
import { getMappingTargetName } from '../helpers';

export const groupMappingItemsByTarget = (
  mappingItems: MappingItem[],
  mappingType: MappingType
): MappingItem[][] => {
  const targetNames: string[] = Array.from(
    new Set(mappingItems.map((item) => getMappingTargetName(item.target, mappingType)))
  );
  return targetNames.map((targetName) =>
    mappingItems.filter((item) => getMappingTargetName(item.target, mappingType) === targetName)
  );
};
