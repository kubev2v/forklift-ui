import { ProviderType } from '@app/common/constants';
import { ICR, IMetaObjectMeta, INameNamespaceRef, IStatusCondition } from '@app/queries/types';

interface IProviderMetadata extends IMetaObjectMeta {
  annotations?: {
    'forklift.konveyor.io/defaultTransferNetwork'?: string;
    [key: string]: string | undefined;
  };
}

export interface IProviderObject extends ICR {
  metadata: IProviderMetadata;
  spec: {
    type: ProviderType | null;
    url?: string; // No url = host provider
    secret?: INameNamespaceRef;
  };
  status?: {
    conditions: IStatusCondition[];
    observedGeneration: number;
  };
}

export interface ICommonProvider {
  uid: string;
  version: string;
  namespace: string;
  name: string;
  selfLink: string;
  type: ProviderType;
  object: IProviderObject;
}

export interface IVMwareProvider extends ICommonProvider {
  datacenterCount: number;
  clusterCount: number;
  hostCount: number;
  vmCount: number;
  networkCount: number;
  datastoreCount: number;
}

// TODO create interfaces for datacenters, networks, hosts, vms?
// TODO rename existing generic types to VMware prefixes
export interface IRHVProvider extends ICommonProvider {
  datacenterCount: number;
  clusterCount: number;
  hostCount: number;
  vmCount: number;
  networkCount: number;
  storageDomainCount: number;
}

export interface IOpenShiftProvider extends ICommonProvider {
  vmCount: number;
  networkCount: number;
  namespaceCount: number;
}

export type InventoryProvider = IVMwareProvider | IRHVProvider | IOpenShiftProvider;
export type SourceInventoryProvider = IVMwareProvider | IRHVProvider;

export interface IProvidersByType {
  [ProviderType.vsphere]: IVMwareProvider[];
  [ProviderType.ovirt]: IRHVProvider[];
  [ProviderType.openshift]: IOpenShiftProvider[];
}

export interface ICorrelatedProvider<T extends InventoryProvider> extends IProviderObject {
  inventory: T | null;
}

export interface ISrcDestRefs {
  source: INameNamespaceRef;
  destination: INameNamespaceRef;
}

export interface IByProvider<T> {
  [providerName: string]: T[];
}
