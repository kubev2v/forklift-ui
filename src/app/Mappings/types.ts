// TODO this structure is speculative for now.
// These types should probably be restructured to match API data later.

import { ProviderType } from '@app/common/constants';
import { ICNVNetwork, IVMwareDatastore, IVMwareNetwork } from '@app/Providers/types';

export enum MappingType {
  Network = 'Network',
  Storage = 'Storage',
}

export interface INetworkMappingItem {
  source: {
    id: string;
  };
  target: ICNVNetwork;
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
    // TODO Should this instead use unique provider ids? what if we rename providers?
    source: {
      type: ProviderType;
      name: string;
    };
    target: {
      type: ProviderType;
      name: string;
    };
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
export type MappingTarget = ICNVNetwork | string; // string = storage class
