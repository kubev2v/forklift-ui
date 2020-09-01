// TODO this structure is speculative for now.
// These types should probably be restructured to match API data later.

import { ProviderType } from '@app/common/constants';
import { ICNVNetwork, ICNVStorageClass } from '@app/Providers/types';

export enum MappingType {
  Network = 'Network',
  Storage = 'Storage',
}
export interface INetworkMappingItem {
  src: {
    id: string;
  };
  target: ICNVNetwork | null;
}

export interface IStorageMappingItem {
  src: {
    id: string;
  };
  target: ICNVStorageClass | null;
}

export type MappingItemTarget = ICNVNetwork | ICNVStorageClass | null;

export interface ICommonMapping {
  type: MappingType;
  name: string;
  provider: {
    // TODO Should this instead use a unique provider id? what if we rename providers?
    type: ProviderType;
    name: string;
  };
  items: INetworkMappingItem[] | IStorageMappingItem[];
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
