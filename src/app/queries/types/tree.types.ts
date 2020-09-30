export enum VMwareTreeType {
  Host = 'Host',
  VM = 'VM',
}

interface ICommonTree {
  kind: string;
  object: {
    id: string;
    parent: {
      Kind: string;
      ID: string;
    } | null;
    name: string;
    selfLink: string;
  } | null;
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
