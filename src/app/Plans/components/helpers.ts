import { ProgressVariant } from '@patternfly/react-core';
import { PlanState } from '@app/common/constants';
import { hasCondition } from '@app/common/helpers';
import { IPlan } from '@app/queries/types';
import { IMigration } from '@app/queries/types/migrations.types';
import { PlanActionButtonType } from '@app/Plans/components/PlansTable';
import { IKubeList } from '@app/client/types';
import { UseQueryResult } from 'react-query';
import { isSameResource } from '@app/queries/helpers';

export const getPlanStatusTitle = (plan: IPlan): string => {
  const condition = plan.status?.conditions.find(
    (condition) =>
      condition.type === 'Ready' ||
      condition.type === 'Executing' ||
      condition.type === 'Succeeded' ||
      condition.type === 'Failed'
  );
  return condition ? condition.type : '';
};

export const getMigStatusState = (state: PlanState | null, isWarmPlan: boolean) => {
  let title: string;
  let variant: ProgressVariant | undefined;
  let filterValue: string;

  switch (true) {
    case state === 'Starting': {
      title = 'Running';
      filterValue = 'Running';
      break;
    }
    case state === 'Finished-Failed':
    case state === 'FailedCopying': {
      title = 'Failed';
      variant = ProgressVariant.danger;
      filterValue = 'Failed';
      break;
    }
    case state === 'Canceled':
    case state === 'CanceledCopying': {
      title = 'Canceled';
      filterValue = 'Canceled';
      break;
    }
    case state === 'Finished-Succeeded': {
      title = 'Succeeded';
      filterValue = 'Succeeded';
      variant = ProgressVariant.success;
      break;
    }
    case state === 'Copying':
    case state === 'PipelineRunning': {
      title = isWarmPlan ? 'Running cutover' : 'Running';
      filterValue = 'Running';
      break;
    }
    case state === 'Finished-Incomplete': {
      title = 'Finished - Incomplete';
      variant = ProgressVariant.warning;
      filterValue = 'Finished - Incomplete';
      break;
    }
    case state === 'NotStarted-NotReady': {
      title = '';
      filterValue = 'Not Ready';
      break;
    }
    case state === 'NotStarted-Ready':
    default: {
      title = '';
      filterValue = 'Ready';
    }
  }

  return {
    title,
    variant,
    filterValue,
  };
};

export const getButtonState = (state: PlanState | null): PlanActionButtonType | null => {
  let type: PlanActionButtonType | null;

  switch (true) {
    case state === 'NotStarted-Ready': {
      type = 'Start';
      break;
    }
    case state === 'Copying': {
      type = 'Cutover';
      break;
    }
    case state === 'Finished-Incomplete':
    case state === 'Finished-Failed':
    case state === 'Canceled':
    case state === 'FailedCopying':
    case state === 'CanceledCopying': {
      type = 'Restart';
      break;
    }
    case state === 'Starting':
    case state === 'StartingCutover':
    case state === 'PipelineRunning':
    case state === 'Finished-Succeeded':
    default: {
      type = null;
    }
  }

  return type;
};

export const getPlanState = (
  plan: IPlan | null,
  migration: IMigration | null,
  migrationQuery: UseQueryResult<IKubeList<IMigration>>
): PlanState | null => {
  if (!plan) return null;
  const isWarm = plan.spec.warm;
  const conditions = plan.status?.conditions || [];
  if (!migration || !plan.status?.migration?.started) {
    if (hasCondition(conditions, 'Ready')) return 'NotStarted-Ready';
    return 'NotStarted-NotReady';
  }
  if (isPlanBeingStarted(plan, migration, migrationQuery)) return 'Starting';

  if (isWarm && !migration.spec.cutover) {
    if (hasCondition(conditions, 'Canceled')) {
      return 'CanceledCopying';
    }
    if (hasCondition(conditions, 'Failed')) {
      return 'FailedCopying';
    }
  }

  if (hasCondition(conditions, 'Canceled')) {
    return 'Canceled';
  }

  if (hasCondition(conditions, 'Failed')) {
    return 'Finished-Failed';
  }

  if (!!plan.status?.migration?.started && canPlanBeStarted(plan)) {
    return 'Finished-Incomplete';
  }

  if (hasCondition(conditions, 'Executing')) {
    const pipelineHasStarted = plan.status?.migration?.vms?.some((vm) =>
      vm.pipeline.some((step) => !!step.started)
    );
    const cutoverTimePassed =
      migration?.spec.cutover && new Date(migration.spec.cutover).getTime() < new Date().getTime();

    if (isWarm) {
      if (cutoverTimePassed) {
        if (!pipelineHasStarted) {
          return 'StartingCutover';
        } else {
          return 'PipelineRunning';
        }
      }

      if (plan.status?.migration?.vms?.some((vm) => (vm.warm?.precopies?.length || 0) > 0)) {
        return 'Copying';
      }

      // Warm migration executing, cutover time not passed, no precopy data: show Starting until copy data appears
      return 'Starting';
    }

    return 'PipelineRunning';
  }

  if (hasCondition(conditions, 'Succeeded')) {
    return 'Finished-Succeeded';
  }

  return null;
};

export const isPlanBeingStarted = (
  plan: IPlan,
  latestMigrationInHistory: IMigration | null,
  migrationsQuery: UseQueryResult<IKubeList<IMigration>>
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

export const canPlanBeStarted = (plan: IPlan): boolean => {
  const conditions = plan.status?.conditions || [];
  if (!hasCondition(conditions, 'Ready') || hasCondition(conditions, 'Executing')) {
    return false;
  }
  const hasEverStarted = plan.status?.migration?.started;
  const hasSomeIncompleteVM =
    plan.status?.migration?.vms?.some((vm) => !hasCondition(vm.conditions || [], 'Succeeded')) ||
    false;
  return !hasEverStarted || hasSomeIncompleteVM;
};
