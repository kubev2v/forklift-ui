import { ICR, IStatusCondition } from '../types/common.types';
import { INetworkMappingItem, IStorageMappingItem } from '../types/mappings.types';
import { ISrcDestRefs } from './providers.types';

export interface IProgress {
  total: number;
  completed: number;
}

export interface IStep {
  name: string;
  progress: IProgress;
  phase?: string;
  annotations?: {
    unit: string;
    [key: string]: string;
  };
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
  started?: string;
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
  apiVersion: string;
  kind: 'Plan';
  spec: {
    description: string;
    provider: ISrcDestRefs;
    targetNamespace: string;
    map: {
      networks: INetworkMappingItem[];
      datastores: IStorageMappingItem[];
    };
    vms: IPlanVM[];
  };
  status?: IPlanStatus;
}
