import { ProviderType } from '@app/common/constants';
import { IStatusCondition } from '@app/common/types';

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

export interface IOpenShiftProvider extends ICommonProvider {
  vmCount: number;
  networkCount: number;
  namespaceCount: number;
}

export type Provider = IVMwareProvider | IOpenShiftProvider;

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

export interface IOpenShiftNetwork {
  type: NetworkType;
  name: string;
  namespace: string;
}

// TODO do these need to be indexed by provider id instead of name?
export interface IVMwareNetworksByProvider {
  [providerName: string]: IVMwareNetwork[];
}

export interface IOpenShiftNetworksByProvider {
  [providerName: string]: IOpenShiftNetwork[];
}

export interface IVMwareDatastore {
  id: string;
  name: string;
}

export interface IProvidersByType {
  [ProviderType.vsphere]: IVMwareProvider[];
  [ProviderType.openshift]: IOpenShiftProvider[];
}

// TODO do these need to be indexed by provider id instead of name?
export interface IVMwareDatastoresByProvider {
  [providerName: string]: IVMwareDatastore[];
}
