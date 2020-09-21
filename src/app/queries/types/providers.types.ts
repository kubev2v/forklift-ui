import { ProviderType } from '@app/common/constants';

export interface IStatusCondition {
  type: string;
  status: string;
  category: string;
  message: string;
  lastTransitionTime: string; // ISO timestamp
}

export interface ICommonProvider {
  uid: string;
  version: string;
  namespace: string;
  name: string;
  selfLink: string;
  type: ProviderType;
  object: {
    metadata: {
      name: string;
      namespace: string;
      selfLink: string;
      uid: string;
      resourceVersion: string;
      generation: number;
      creationTimestamp: string; // ISO timestamp
    };
    spec: {
      type: ProviderType;
      url: string; // TODO is this the "Endpoint" column?
      secret: {
        namespace: string;
        name: string;
      };
    };
    status: {
      conditions: IStatusCondition[];
      observedGeneration: number;
    };
  };
}

export interface IVMwareProvider extends ICommonProvider {
  datacenterCount: number;
  clusterCount: number;
  hostCount: number;
  vmCount: number;
  networkCount: number;
  datastoreCount: number;
}

export interface ICNVProvider extends ICommonProvider {
  vmCount: number;
  networkCount: number;
  namespaceCount: number;
  storageClasses: string[]; // TODO this is a separate resource, need to move it
}

export type Provider = IVMwareProvider | ICNVProvider;

// TODO this structure is speculative. Check with Jeff.
export interface IHostNetwork {
  name: string;
  address: string;
  isDefault?: boolean;
}

// TODO this structure is speculative. Check with Jeff.
export interface IHost {
  metadata: {
    name: string;
    network: IHostNetwork;
    bandwidth: string;
    mtu: number;
  };
}

// TODO do these need to be indexed by provider id instead of name?
export interface IHostsByProvider {
  [providerName: string]: IHost[];
}

export interface IVMwareNetwork {
  id: string;
  name: string;
}

// TODO not sure if these are right
export enum NetworkType {
  Pod = 'pod',
  Multis = 'multis',
}

export interface ICNVNetwork {
  type: NetworkType;
  name: string;
  namespace: string;
}

// TODO do these need to be indexed by provider id instead of name?
export interface IVMwareNetworksByProvider {
  [providerName: string]: IVMwareNetwork[];
}

export interface ICNVNetworksByProvider {
  [providerName: string]: ICNVNetwork[];
}

export interface IVMwareDatastore {
  id: string;
  name: string;
}

export interface IProvidersByType {
  vsphere: IVMwareProvider[];
  openshift: ICNVProvider[];
}

// TODO do these need to be indexed by provider id instead of name?
export interface IVMwareDatastoresByProvider {
  [providerName: string]: IVMwareDatastore[];
}
