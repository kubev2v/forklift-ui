import { Hook } from '@app/Hooks/types';
import { CR } from '@app/common/types';
import { Mapping } from '@app/Mappings/types';
import { IVMwareProvider, ICNVProvider, IHost } from '@app/Providers/types';

export interface IAddPlanDisabledObjModel {
  isAddPlanDisabled: boolean;
  disabledText: string;
}

export interface PlanVM {
  ID: string;
  Hooks: {
    Before: Hook;
    After: Hook;
  };
  Host: IHost;
}

export interface PlanStatus {
  Conditions: boolean;
  ObservedGeneration: number;
}

export interface Plan extends CR {
  Spec: {
    Provider: {
      sourceProvider: IVMwareProvider;
      destinationProvider: ICNVProvider;
    };
    Map: Mapping;
    Warm: boolean;
    VMs: PlanVM[];
  };
  Status: PlanStatus;
}

export interface Migration {
  Plan: Plan;
  Schedule: {
    Begin: Date;
    End: Date;
  };
  Status: {
    Ready: boolean;
    StorageReady: boolean;
  };
}
