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
    id: string;
  };
  destination: {
    name: string;
    namespace: string;
    type: 'pod' | 'multis';
  };
}

export interface IStorageMappingItem {
  source: {
    id: string;
  };
  destination: {
    storageClass: string;
  };
}

export type MappingItem = INetworkMappingItem | IStorageMappingItem;

export type CommonMappingCondition =
  | 'Ready'
  | 'SourceProviderNotValid'
  | 'DestinationProviderNotValid';
export type NetworkMappingCondition =
  | CommonMappingCondition
  | 'SourceNetworkNotValid'
  | 'DestinationNetworkNotValid';
export type StorageMappingCondition =
  | CommonMappingCondition
  | 'SourceDatastoreNotValid'
  | 'DestinationDatastoreNotValid';
export type MappingCondition = NetworkMappingCondition | StorageMappingCondition;

export interface ICommonMapping {
  metadata: {
    name: string;
    namespace: string;
  };
  provider: {
    source: IVMwareProvider;
    target: IOpenShiftProvider;
  };
  items: MappingItem[];
  status?: {
    conditions: MappingCondition[];
  };
}

export interface INetworkMapping extends ICommonMapping {
  items: INetworkMappingItem[];
  status?: {
    conditions: NetworkMappingCondition[];
  };
}

export interface IStorageMapping extends ICommonMapping {
  items: IStorageMappingItem[];
  status?: {
    conditions: StorageMappingCondition[];
  };
}

export type Mapping = INetworkMapping | IStorageMapping;

export type MappingSource = IVMwareDatastore | IVMwareNetwork;
export type MappingTarget = IOpenShiftNetwork | IStorageClass;
