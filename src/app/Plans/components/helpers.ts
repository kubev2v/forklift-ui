import { PlanStatusAPIType, PlanStatusDisplayType } from '@app/common/constants';
import { IPlan } from '@app/queries/types';

export const getPlanStatusTitle = (plan: IPlan): string => {
  const condition = plan.status?.conditions.find(
    (condition) =>
      condition.type === PlanStatusAPIType.Ready ||
      condition.type === PlanStatusAPIType.Executing ||
      condition.type === PlanStatusAPIType.Succeeded ||
      condition.type === PlanStatusAPIType.Failed
  );
  return condition ? PlanStatusDisplayType[condition.type] : '';
};
