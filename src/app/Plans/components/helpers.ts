import { PlanStatusType, PlanStatusDisplayType } from '@app/common/constants';
import { IPlan } from '@app/queries/types';

export const getPlanStatusTitle = (plan: IPlan): string => {
  const condition = plan.status?.conditions.find(
    (condition) =>
      condition.type === PlanStatusType.Ready ||
      condition.type === PlanStatusType.Executing ||
      condition.type === PlanStatusType.Succeeded ||
      condition.type === PlanStatusType.Failed
  );
  return condition ? PlanStatusDisplayType[condition.type] : '';
};
