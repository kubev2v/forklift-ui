import { IOpenShiftProvider, IVMwareProvider } from './providers.types';
import { IVMwareNetwork, IOpenShiftNetwork } from './networks.types';
import { IVMwareDatastore } from './datastores.types';
import { IStorageClass } from './storageClasses.types';

export enum MappingType {
  Network = 'Network',
  Storage = 'Storage',
}

export interface INetworkMappingItem {
  source: {
    id: string; // TODO see what these actually need to be in the API?
  };
  target: IOpenShiftNetwork;
}

export interface IStorageMappingItem {
  source: {
    id: string; // TODO see what these actually need to be in the API?
  };
  target: IStorageClass;
}

export type MappingItem = INetworkMappingItem | IStorageMappingItem;

export interface ICommonMapping {
  type: MappingType;
  name: string;
  provider: {
    source: IVMwareProvider;
    target: IOpenShiftProvider;
  };
  items: MappingItem[];
}

export interface INetworkMapping extends ICommonMapping {
  type: MappingType.Network;
  items: INetworkMappingItem[];
}

export interface IStorageMapping extends ICommonMapping {
  type: MappingType.Storage;
  items: IStorageMappingItem[];
}

export type Mapping = INetworkMapping | IStorageMapping;

export type MappingSource = IVMwareDatastore | IVMwareNetwork;
export type MappingTarget = IOpenShiftNetwork | IStorageClass;
