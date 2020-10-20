import { StatusCategoryType, StatusConditionsType } from '@app/common/constants';
import { IStatusCondition } from '@app/queries/types';

export const hasCondition = (conditions: IStatusCondition[], type: string): boolean => {
  return !!conditions.find((condition) => condition.type === type);
};

export const hasConditionsByCategory = (
  conditions: IStatusCondition[],
  category: string
): boolean => {
  return !!conditions.find((condition) => condition.category === category);
};

export const mostSeriousCondition = (conditions: IStatusCondition[]): string => {
  if (hasConditionsByCategory(conditions, StatusCategoryType.Critical)) {
    return StatusCategoryType.Critical;
  } else if (hasConditionsByCategory(conditions, StatusCategoryType.Error)) {
    return StatusCategoryType.Error;
  } else if (
    hasConditionsByCategory(conditions, StatusCategoryType.Warn) &&
    !hasCondition(conditions, StatusConditionsType.Ready)
  ) {
    return StatusCategoryType.Warn;
  } else if (
    hasConditionsByCategory(conditions, StatusCategoryType.Advisory) &&
    !hasCondition(conditions, StatusConditionsType.Ready)
  ) {
    return StatusCategoryType.Advisory;
  } else if (
    hasConditionsByCategory(conditions, StatusCategoryType.Required) &&
    hasCondition(conditions, StatusConditionsType.Ready)
  ) {
    return StatusConditionsType.Ready;
  } else return 'Unknown';
};
