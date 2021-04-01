import { IKubeList } from '@app/client/types';
import { PlanStatusType, PlanStatusDisplayType } from '@app/common/constants';
import { hasCondition } from '@app/common/helpers';
import { isSameResource } from '@app/queries/helpers';
import { IPlan } from '@app/queries/types';
import { IMigration } from '@app/queries/types/migrations.types';
import { QueryResult } from 'react-query';

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

// TODO maybe generalize this for cold migrations too
type WarmPlanState =
  | 'NotStarted'
  | 'Starting'
  | 'Copying'
  | 'AbortedCopying'
  | 'StartingCutover'
  | 'Cutover'
  | 'Finished';

export const getWarmPlanState = (
  plan: IPlan | null,
  migration: IMigration | null,
  migrationsQuery: QueryResult<IKubeList<IMigration>>
): WarmPlanState | null => {
  if (!plan || !plan.spec.warm) return null;
  if (!migration) return 'NotStarted';
  if (isPlanBeingStarted(plan, migration, migrationsQuery)) {
    return 'Starting';
  }
  const conditions = plan.status?.conditions || [];
  if (
    (hasCondition(conditions, PlanStatusType.Canceled) ||
      hasCondition(conditions, PlanStatusType.Failed)) &&
    !migration.spec.cutover
  ) {
    return 'AbortedCopying';
  }
  if (!!migration && !!plan.status?.migration?.completed) return 'Finished';
  if (hasCondition(conditions, PlanStatusType.Executing)) {
    const pipelineHasStarted = plan.status?.migration?.vms?.some((vm) =>
      vm.pipeline.some((step) => !!step.started)
    );
    if (migration.spec.cutover && !pipelineHasStarted) {
      return 'StartingCutover';
    }
    if (migration.spec.cutover && pipelineHasStarted) {
      return 'Cutover';
    }
    if (plan.status?.migration?.vms?.some((vm) => (vm.warm?.precopies?.length || 0) > 0)) {
      return 'Copying';
    }
    return 'Starting';
  }
  if (
    hasCondition(conditions, PlanStatusType.Succeeded) ||
    hasCondition(conditions, PlanStatusType.Canceled) ||
    hasCondition(conditions, PlanStatusType.Failed)
  ) {
    return 'Finished';
  }
  return null;
};

export const canPlanBeStarted = (plan: IPlan): boolean => {
  const conditions = plan.status?.conditions || [];
  if (
    !hasCondition(conditions, PlanStatusType.Ready) ||
    hasCondition(conditions, PlanStatusType.Executing)
  ) {
    return false;
  }
  const hasEverStarted = plan.status?.migration?.started;
  const hasSomeIncompleteVM =
    plan.status?.migration?.vms?.some(
      (vm) => !hasCondition(vm.conditions || [], PlanStatusType.Succeeded)
    ) || false;
  return !hasEverStarted || hasSomeIncompleteVM;
};

export const isPlanBeingStarted = (
  plan: IPlan,
  latestMigrationInHistory: IMigration | null,
  migrationsQuery: QueryResult<IKubeList<IMigration>>
): boolean => {
  // True if we just don't have any status data yet
  if (
    (!!latestMigrationInHistory && !plan.status?.migration?.started) ||
    (plan.status?.migration?.started && (plan.status?.migration?.vms?.length || 0) === 0)
  ) {
    return true;
  }
  const migrationsMatchingPlan =
    migrationsQuery.data?.items?.filter((migration) =>
      isSameResource(migration.spec.plan, plan.metadata)
    ) || [];
  const latestMatchingMigration = migrationsMatchingPlan.sort((a, b) => {
    const { creationTimestamp: aTimestamp } = a.metadata;
    const { creationTimestamp: bTimestamp } = b.metadata;
    if (!aTimestamp || !bTimestamp) return 0;
    if (aTimestamp < bTimestamp) return -1;
    if (aTimestamp > bTimestamp) return 1;
    return 0;
  })[migrationsMatchingPlan.length - 1];
  // True if the plan's migration history hasn't picked up the latest migration CR yet
  return (
    migrationsMatchingPlan.length > 0 &&
    (!latestMigrationInHistory ||
      !isSameResource(latestMigrationInHistory.metadata, latestMatchingMigration.metadata))
  );
};
