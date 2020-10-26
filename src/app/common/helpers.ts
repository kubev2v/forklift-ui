import dayjs from 'dayjs';
import { StatusCategoryType, PlanStatusAPIType } from '@app/common/constants';
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
    !hasCondition(conditions, PlanStatusAPIType.Ready)
  ) {
    return StatusCategoryType.Warn;
  } else if (
    hasConditionsByCategory(conditions, StatusCategoryType.Advisory) &&
    !hasCondition(conditions, PlanStatusAPIType.Ready)
  ) {
    return StatusCategoryType.Advisory;
  } else if (
    hasConditionsByCategory(conditions, StatusCategoryType.Required) &&
    hasCondition(conditions, PlanStatusAPIType.Ready)
  ) {
    return PlanStatusAPIType.Ready;
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

const padNum = (num: number) => (num < 10 ? `0${num}` : `${num}`);

export const formatDuration = (
  start?: string | dayjs.Dayjs,
  end?: string | dayjs.Dayjs
): string => {
  if (!start) return '00:00:00';
  let seconds = (end ? dayjs(end) : dayjs()).diff(dayjs(start), 'second');
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;
  return `${padNum(hours)}:${padNum(minutes)}:${padNum(seconds)}`;
};
