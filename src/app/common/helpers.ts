import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { StatusCategoryType, PlanStatusType, StepType, ProviderType } from '@app/common/constants';
import {
  ICR,
  IObjectReference,
  IProviderObject,
  IStatusCondition,
  IStep,
  IVMStatus,
} from '@app/queries/types';
import { QueryResult } from 'react-query';
import { IKubeList } from '@app/client/types';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

export const hasCondition = (conditions: IStatusCondition[], type: string): boolean => {
  return !!conditions.find((condition) => condition.type === type);
};

export const findConditionByCategory = (
  conditions: IStatusCondition[],
  category: string
): IStatusCondition | undefined => {
  return conditions.find((condition) => condition.category === category);
};

export const getMostSeriousCondition = (conditions: IStatusCondition[]): string => {
  if (findConditionByCategory(conditions, StatusCategoryType.Critical)) {
    return StatusCategoryType.Critical;
  }
  if (findConditionByCategory(conditions, StatusCategoryType.Error)) {
    return StatusCategoryType.Error;
  }
  if (findConditionByCategory(conditions, StatusCategoryType.Warn)) {
    return StatusCategoryType.Warn;
  }
  if (
    conditions.find((condition) => condition.reason === 'Started' || condition.reason === 'Running')
  ) {
    return 'Pending';
  }
  if (
    hasCondition(conditions, PlanStatusType.Ready) ||
    conditions.find((condition) => condition.reason === 'Completed')
  ) {
    return PlanStatusType.Ready;
  }
  if (findConditionByCategory(conditions, StatusCategoryType.Required)) {
    return StatusCategoryType.Required;
  }
  if (findConditionByCategory(conditions, StatusCategoryType.Advisory)) {
    return StatusCategoryType.Advisory;
  }

  return 'Unknown';
};

export const findCurrentStep = (
  pipeline: IStep[]
): { currentStep: IStep | undefined; currentStepIndex: number } => {
  if (pipeline.length === 0) return { currentStep: undefined, currentStepIndex: 0 };
  let currentStep: IStep;
  if (!pipeline[0].started) {
    currentStep = pipeline[0];
  } else {
    currentStep =
      pipeline
        .slice(0)
        .reverse()
        .find((step) => !!step.error || !!step.started) || pipeline[pipeline.length - 1];
  }
  const currentStepIndex = currentStep ? pipeline.indexOf(currentStep) : 0;
  return { currentStep, currentStepIndex };
};

export const formatTimestamp = (timestamp?: string): string =>
  timestamp ? dayjs(timestamp).format('DD MMM YYYY, HH:mm:ss z') : '';

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

export const getStepType = (status: IVMStatus, index: number, isCanceled: boolean): StepType => {
  const { currentStepIndex } = findCurrentStep(status.pipeline);
  const step = status.pipeline[index];
  if (step?.started && step?.completed && index === currentStepIndex && isCanceled) {
    return StepType.Canceled;
  }
  if (step?.completed || index < currentStepIndex) return StepType.Full;
  if (status.started && index === currentStepIndex)
    return isCanceled ? StepType.Canceled : StepType.Half;
  return StepType.Empty;
};

export const isStepOnError = (status: IVMStatus, index: number): boolean => {
  const step = status.pipeline[index];
  if (step.error) return true;
  return false;
};

export const numStr = (num: number | undefined): string => {
  if (num === undefined) return '';
  return String(num);
};

export const getObjectRef = (cr: ICR): IObjectReference => ({
  apiVersion: cr.apiVersion,
  kind: cr.kind,
  name: cr.metadata.name,
  namespace: cr.metadata.namespace,
  uid: cr.metadata.uid,
});

export const getMinutesUntil = (timestamp: Date | string): string => {
  const minutes = dayjs(timestamp).diff(dayjs(), 'minute');
  if (minutes <= 0) return 'less than 1 minute';
  if (minutes === 1) return '1 minute';
  return `${minutes} minutes`;
};

export const getAvailableProviderTypes = (
  clusterProvidersQuery: QueryResult<IKubeList<IProviderObject>>
): ProviderType[] => {
  const clusterProviders = clusterProvidersQuery.data?.items || [];
  return Array.from(new Set(clusterProviders.map((provider) => provider.spec.type)))
    .filter((type) => !!type)
    .sort() as ProviderType[];
};
