import { IVMwareObjRef } from './common.types';

export interface ISourceVMConcern {
  label: string;
  category: 'Warning' | 'Critical' | 'Information' | 'Advisory';
  assessment: string;
}

export interface ISourceVM {
  id: string;
  revision: number;
  name: string;
  selfLink: string;
  concerns: ISourceVMConcern[];
  revisionValidated: number;
}

export interface IVMwareVMDisk {
  file: string;
  datastore: IVMwareObjRef;
}

export interface IVMwareVM extends ISourceVM {
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
  guestName: string;
  balloonedMemory: number;
  ipAddress: string;
  networks: IVMwareObjRef[];
  disks: IVMwareVMDisk[];
  concerns: ISourceVMConcern[];
  revisionValidated: number;
  isTemplate: boolean;
}

export interface IRHVVM extends ISourceVM {
  description: string;
  cluster: string;
  host: string;
}
