import { IVMwareObjRef } from './common.types';

export interface IVMwareNetwork {
  id: string;
  parent: IVMwareObjRef;
  name: string;
  selfLink: string;
}

export interface IOpenShiftNetwork {
  uid: string;
  version: string;
  namespace: string;
  name: string;
  selfLink: string;
  type?: 'pod';
  // There's more if we load with ?detail=1
}
