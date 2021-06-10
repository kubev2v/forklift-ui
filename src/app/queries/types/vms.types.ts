import { IVMwareObjRef } from './common.types';

export interface ISourceVMConcern {
  label: string;
  category: 'Warning' | 'Critical' | 'Information' | 'Advisory';
  assessment: string;
}

interface IBaseSourceVM {
  id: string;
  revision: number;
  name: string;
  selfLink: string;
  concerns: ISourceVMConcern[];
  revisionValidated: number;
  guestName: string;
}

export interface IVMwareVMDisk {
  file: string;
  datastore: IVMwareObjRef;
}

export interface IVMwareVM extends IBaseSourceVM {
  parent: IVMwareObjRef;
  uuid: string;
  firmware: string;
  cpuAffinity: unknown[];
  cpuHostAddEnabled: boolean;
  cpuHostRemoveEnabled: boolean;
  memoryHotAddEnabled: boolean;
  cpuCount: number;
  coresPerSocket: number;
  memoryMB: number;
  balloonedMemory: number;
  ipAddress: string;
  networks: IVMwareObjRef[];
  disks: IVMwareVMDisk[];
  concerns: ISourceVMConcern[];
  revisionValidated: number;
  isTemplate: boolean;
}

export interface IRHVNIC {
  id: string;
  name: string;
  interface: string;
  profile: {
    id: string;
    name: string;
    description: string;
    selfLink: string;
    revision: number;
    network: string;
    qos: string;
  };
}

export interface IRHVDiskAttachment {
  id: string;
  disk: {
    id: string;
    name: string;
    description: string;
    selfLink: string;
    revision: number;
    shared: boolean;
    profile: string;
    storageDomain: string;
  };
}

export interface IRHVVM extends IBaseSourceVM {
  description: string;
  cluster: string;
  host: string;
  nics: IRHVNIC[];
  diskAttachments: IRHVDiskAttachment[];
}

export type SourceVM = IVMwareVM | IRHVVM;
