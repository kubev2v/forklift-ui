import { ICR, INameNamespaceRef, IStatusCondition } from '../types/common.types';
import { INetworkMappingItem, IStorageMappingItem } from '../types/mappings.types';

export interface IProgress {
  total: number;
  completed: number;
}

export interface IStep {
  name: string;
  progress: IProgress;
  phase?: string;
  annotations?: Record<string, unknown>;
  started?: string;
  completed?: string;
  error?: IError;
  tasks?: IStep[];
}

export interface IError {
  phase: string;
  reasons: string[];
}

export interface IVMStatus {
  id: string;
  pipeline: {
    tasks: IStep[];
  };
  phase: string;
  error?: IError;
  completed?: string;
}

export interface IPlanVM {
  id: string;
  // hook?: ??? // TODO add this when we add hooks
}

export interface IPlanStatus {
  migration?: {
    active: string;
    completed?: string;
    started?: string;
    vms?: IVMStatus[];
  };
  conditions: IStatusCondition[];
  observedGeneration: number;
}

export interface IPlan extends ICR {
  spec: {
    description: string;
    provider: {
      source: INameNamespaceRef;
      destination: INameNamespaceRef;
    };
    map: {
      networks: INetworkMappingItem[];
      datastores: IStorageMappingItem[];
    };
    vms: IPlanVM[];
  };
  status?: IPlanStatus;
}

// TODO: This is speculative
export interface IMigration {
  plan: IPlan;
  id: string;
  schedule: {
    begin: string;
    end: string;
  };
  status: {
    ready: boolean;
    storageReady: boolean;
    nbVMsDone: number;
  };
  status2: IVMStatus;
  other: {
    copied: number;
    total: number;
    status: string;
  };
}
