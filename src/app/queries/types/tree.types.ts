import { IVMwareObjRef } from './common.types';

export enum VMwareTreeType {
  Host = 'Host',
  VM = 'VM',
}

export interface ICommonTreeObject {
  id: string;
  parent: IVMwareObjRef | null;
  name: string;
  selfLink: string;
}

interface ICommonTree {
  kind: string;
  object: ICommonTreeObject | null;
  children: ICommonTree[] | null;
}

export interface IVMwareHostTree extends ICommonTree {
  kind: '' | 'Datacenter' | 'Cluster' | 'Folder' | 'Host' | 'VM';
  children: IVMwareHostTree[] | null;
}

export interface IVMwareVMTree extends ICommonTree {
  kind: '' | 'Datacenter' | 'Folder' | 'VM';
  children: IVMwareVMTree[] | null;
}

export type VMwareTree = IVMwareHostTree | IVMwareVMTree;
