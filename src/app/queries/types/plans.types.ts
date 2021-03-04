import { ICR, IMetaObjectMeta, INameNamespaceRef, IStatusCondition } from '../types/common.types';
import { ISrcDestRefs } from './providers.types';

export interface IProgress {
  total: number;
  completed: number;
}

export interface IStep {
  name: string;
  description: string;
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
  pipeline: IStep[];
  phase: string;
  error?: IError;
  started?: string;
  completed?: string;
  conditions?: IStatusCondition[];
}

export interface IPlanVM {
  id: string;
  // hook?: ??? // TODO add this when we add hooks
}

export interface IMigrationHistoryItem {
  conditions: IStatusCondition[];
  migration: IMetaObjectMeta;
  plan: IMetaObjectMeta;
  provider: IMetaObjectMeta;
}

export interface IPlanStatus {
  migration?: {
    active: string;
    completed?: string;
    started?: string;
    vms?: IVMStatus[];
    history?: IMigrationHistoryItem[];
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
    transferNetwork: string;
    map: {
      network: INameNamespaceRef;
      storage: INameNamespaceRef;
    };
    vms: IPlanVM[];
  };
  status?: IPlanStatus;
}
