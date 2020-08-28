// TODO this structure is speculative for now.
// These types should probably be restructured to match API data later.

export enum MappingType {
  Network = 'Network',
  Storage = 'Storage',
}

export interface ICommonMapping {
  type: MappingType;
  name: string;
  // Other stuff common to storage and network mappings
}

export interface INetworkMapping extends ICommonMapping {
  type: MappingType.Network;
  networkSpecificStuff: any; // TODO remove me
}

export interface IStorageMapping extends ICommonMapping {
  type: MappingType.Storage;
  storageSpecificStuff: any; // TODO remove me
}

export type Mapping = INetworkMapping | IStorageMapping;
