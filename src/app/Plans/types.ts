// TODO This is speculative until details are avail.

import { IHook } from '@app/Hooks/types';
import { IVMwareProvider, ICNVProvider } from '@app/Providers/types';

export interface IAddPlanDisabledObjModel {
  isAddPlanDisabled: boolean;
  disabledText: string;
}

export interface IMigHooks {
  before: boolean;
  beforeHook: IHook;
  after: boolean;
  afterHook: IHook;
}

export interface IMigVM {
  ID: string;
  Hooks: IMigHooks;
  Creds: string;
}

export interface IMigration {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp: string;
  };
  spec: {
    migPlanRef: {
      name: string;
      namespace: string;
    };
    quiescePods: boolean;
    stage: boolean;
  };
  status?: string;
}

export interface IMigPlan {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp: string;
  };
  spec: {
    srcProvider: IVMwareProvider;
    dstProvider: ICNVProvider;
    mapping: string;
    warm: boolean;
    hooks: IMigHooks;
    migVMList: IMigVM[];
  };
}
export interface IPlan {
  MigPlan: IMigPlan;
  Migrations: IMigration[];
  PlanStatus: {
    conflictErrorMsg: string;
    finalMigrationComplete: boolean;
    hasCanceledCondition: boolean;
    hasCancelingCondition: boolean;
    hasClosedCondition: boolean;
    hasConflictCondition: boolean;
    hasNotReadyCondition: boolean;
    hasPODWarnCondition: boolean;
    hasPVWarnCondition: boolean;
    hasReadyCondition: boolean;
    hasRunningMigrations: boolean;
    hasSucceededMigration: boolean;
    hasSucceededStage: boolean;
    isPlanLocked: boolean;
    latestType: string;
    latestIsFailed: boolean;
  };
}
