import { IVMwareNetwork, IOpenShiftNetwork } from './networks.types';
import { IVMwareDatastore } from './datastores.types';
import { IStorageClass } from './storageClasses.types';
import { INameNamespaceRef } from './common.types';

export enum MappingType {
  Network = 'Network',
  Storage = 'Storage',
}

export interface INetworkMappingItem {
  source: {
    id: string;
  };
  destination:
    | {
        name: string;
        namespace: string;
        type: 'multus';
      }
    | { type: 'pod' };
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

export interface ICommonMappingSpec {
  provider: {
    source: INameNamespaceRef;
    destination: INameNamespaceRef;
  };
}

export interface INetworkMappingSpec extends ICommonMappingSpec {
  map: INetworkMappingItem[];
}

export interface IStorageMappingSpec extends ICommonMappingSpec {
  map: IStorageMappingItem[];
}

export interface ICommonMapping {
  apiVersion: string;
  kind: 'NetworkMap' | 'StorageMap';
  metadata: {
    name: string;
    namespace: string;
  };
  spec: ICommonMappingSpec;
}

export interface INetworkMapping extends ICommonMapping {
  spec: INetworkMappingSpec;
  status?: {
    conditions: NetworkMappingCondition[];
  };
}

export interface IStorageMapping extends ICommonMapping {
  spec: IStorageMappingSpec;
  status?: {
    conditions: StorageMappingCondition[];
  };
}

export type Mapping = INetworkMapping | IStorageMapping;

export const POD_NETWORK = {
  name: 'Target namespace pod network',
  namespace: 'pod',
  type: 'pod',
  selfLink: 'pod',
};
export type MappingSource = IVMwareDatastore | IVMwareNetwork;
export type MappingTarget = IOpenShiftNetwork | typeof POD_NETWORK | IStorageClass;
