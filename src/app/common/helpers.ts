import dayjs from 'dayjs';
import { StatusCategoryType, StatusConditionsType } from '@app/common/constants';
import { IStatusCondition, IStep } from '@app/queries/types';

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

export const findCurrentStep = (
  tasks: IStep[]
): { currentStep: IStep | undefined; currentStepIndex: number } => {
  const currentStep = tasks.find((task) => !!task.started && !task.completed);
  const currentStepIndex = currentStep ? tasks.indexOf(currentStep) : tasks.length - 1;
  return { currentStep, currentStepIndex };
};

export const formatTimestamp = (timestamp?: string): string =>
  timestamp ? dayjs(timestamp).format('DD MMM YYYY, HH:mm:ss') : '';

export const formatDuration = (
  start?: string | dayjs.Dayjs,
  end?: string | dayjs.Dayjs
): string => {
  if (!start) return '00:00:00';
  const elapsedSeconds = (end ? dayjs(end) : dayjs()).diff(dayjs(start), 'second');
  return dayjs().startOf('day').second(elapsedSeconds).format('HH:mm:ss');
};
