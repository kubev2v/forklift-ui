// TODO this structure is speculative for now.
// These types should probably be restructured to match API data later.

import { ProviderType } from '@app/common/constants';
import {
  IOpenShiftNetwork,
  IOpenShiftProvider,
  IVMwareDatastore,
  IVMwareNetwork,
  IVMwareProvider,
} from './providers.types';
import { IStorageClass } from './storageClasses.types';

export enum MappingType {
  Network = 'Network',
  Storage = 'Storage',
}

export interface INetworkMappingItem {
  source: {
    id: string;
  };
  target: IOpenShiftNetwork;
}

export interface IStorageMappingItem {
  source: {
    id: string;
  };
  target: string; // storage class
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
