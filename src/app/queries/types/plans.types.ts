import { IHook } from '../types/hooks.types';
import { ICR } from '../types/common.types';
import { Mapping } from '../types/mappings.types';
import { IVMwareProvider, ICNVProvider, IHost } from '../types/providers.types';

export interface IPlanVM {
  uid: string;
  hooks: {
    before: IHook;
    after: IHook;
  };
  host: IHost;
}

export interface IPlanStatus {
  conditions: boolean;
  observedGeneration: number;
}

export interface IPlan extends ICR {
  spec: {
    provider: {
      sourceProvider: IVMwareProvider;
      destinationProvider: ICNVProvider;
    };
    map: Mapping;
    warm: boolean;
    vmList: IPlanVM[];
  };
  status: IPlanStatus;
}

export interface IMigration {
  plan: IPlan;
  schedule: {
    begin: Date;
    end: Date;
  };
  status: {
    ready: boolean;
    storageReady: boolean;
  };
}

export interface IVM {
  name: string;
  migrationAnalysis: string;
  datacenter: string;
  cluster: string;
  host: string;
  folderPath: string;
  analysisDescription: string;
}
