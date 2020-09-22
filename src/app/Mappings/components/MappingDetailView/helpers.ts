import { MappingItem, MappingTarget, MappingType } from '@app/queries/types';
import { getMappingItemTargetName } from '../helpers';

export const groupMappingItemsByTarget = (
  mappingItems: MappingItem[],
  mappingType: MappingType,
  availableTargets: MappingTarget[]
): MappingItem[][] => {
  const targetNames: string[] = Array.from(
    new Set(
      mappingItems.map((item) =>
        getMappingItemTargetName(item.target, mappingType, availableTargets)
      )
    )
  );
  return targetNames.map((targetName) =>
    mappingItems.filter(
      (item) => getMappingItemTargetName(item.target, mappingType, availableTargets) === targetName
    )
  );
};
