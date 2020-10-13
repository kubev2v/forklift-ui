import { IVMwareObjRef } from './common.types';

export interface IVMwareDatastore {
  id: string;
  parent: IVMwareObjRef;
  name: string;
  selfLink: string;
  type: string;
  capacity: number;
  free: number;
  maintenance: string;
}
