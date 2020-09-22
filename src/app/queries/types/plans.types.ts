import { IHook } from '../types/hooks.types';
import { ICR, IStatusCondition } from '../types/common.types';
import { Mapping } from '../types/mappings.types';
import { IVMwareProvider, IOpenShiftProvider, IHost } from '../types/providers.types';

export interface IVM {
  name: string;
  migrationAnalysis: string;
  datacenter: string;
  cluster: string;
  host: string;
  folderPath: string;
  analysisDescription: string;
}

export interface IProgress {
  total: number;
  completed: number;
}

export interface IStep {
  name: string;
  progress: IProgress;
  phase: string;
}

export interface IError {
  phase: string;
  reasons: string[];
}

export interface IVMStatus {
  id: string;
  pipeline: IStep[];
  step: number;
  completed: boolean;
  error: IError;
}

export interface IPlanVM {
  uid: string;
  hooks: {
    before: IHook;
    after: IHook;
  };
  host: IHost;
}

export interface IPlanStatus {
  conditions: IStatusCondition[];
  observedGeneration: number;
}

export interface IPlan extends ICR {
  spec: {
    description: string;
    provider: {
      sourceProvider: IVMwareProvider;
      destinationProvider: IOpenShiftProvider;
    };
    map: {
      networks: Mapping[];
      datastores: Mapping[];
    };
    warm: boolean;
    vmList: IPlanVM[];
  };
  status: IPlanStatus;
}

// TODO: This is speculative
export interface IMigration {
  plan: IPlan;
  schedule: {
    begin: number;
    end: number;
  };
  status: {
    ready: boolean;
    storageReady: boolean;
    nbVMsDone: number;
  };
}
