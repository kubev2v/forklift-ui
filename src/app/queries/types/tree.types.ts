import { IVMwareObjRef } from './common.types';

export enum InventoryTreeType {
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

export interface IInventoryHostTree extends ICommonTree {
  kind: '' | 'Datacenter' | 'Cluster' | 'Folder' | 'Host' | 'VM';
  children: IInventoryHostTree[] | null;
}

export interface IVMwareFolderTree extends ICommonTree {
  kind: '' | 'Datacenter' | 'Folder' | 'VM';
  children: IVMwareFolderTree[] | null;
}

export type InventoryTree = IInventoryHostTree | IVMwareFolderTree;
