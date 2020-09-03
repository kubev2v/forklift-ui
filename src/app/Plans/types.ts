import { IHook } from '@app/Hooks/types';
import { ICR } from '@app/common/types';
import { Mapping } from '@app/Mappings/types';
import { IVMwareProvider, ICNVProvider, IHost } from '@app/Providers/types';

export interface IAddPlanDisabledObjModel {
  isAddPlanDisabled: boolean;
  disabledText: string;
}

export interface IPlanVM {
  ID: string;
  Hooks: {
    Before: IHook;
    After: IHook;
  };
  Host: IHost;
}

export interface IPlanStatus {
  Conditions: boolean;
  ObservedGeneration: number;
}

export interface IPlan extends ICR {
  Spec: {
    Provider: {
      sourceProvider: IVMwareProvider;
      destinationProvider: ICNVProvider;
    };
    Map: Mapping;
    Warm: boolean;
    VMs: IPlanVM[];
  };
  Status: IPlanStatus;
}

export interface IMigration {
  Plan: IPlan;
  Schedule: {
    Begin: Date;
    End: Date;
  };
  Status: {
    Ready: boolean;
    StorageReady: boolean;
  };
}
