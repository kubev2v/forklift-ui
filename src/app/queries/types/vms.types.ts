import { IVMwareObjRef } from './common.types';

export interface IVMwareVMDisk {
  file: string;
  datastore: IVMwareObjRef;
}

export interface IVMwareVMConcern {
  label: string;
  category: 'Warning' | 'Critical' | 'Information' | 'Advisory';
  assessment: string;
}

export interface IVMwareVM {
  id: string;
  revision: number;
  parent: IVMwareObjRef;
  name: string;
  selfLink: string;
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
  concerns: IVMwareVMConcern[];
  revisionValidated: number;
  isTemplate: boolean;
}
