import { IHook } from '@app/Hooks/types';
import { ICR } from '@app/common/types';
import { Mapping } from '@app/Mappings/types';
import { IVMwareProvider, ICNVProvider, IHost } from '@app/Providers/types';

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
  bbservedGeneration: number;
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
