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

/*
interface IWarmMigrationStatus {
  // whether it's warm, whether it's in cutover, whether there are errors etc
  // TODO or maybe just have a union type for states of a warm plan
}

export const getWarmMigrationStatus = (plan: IPlan) => {};
*/
