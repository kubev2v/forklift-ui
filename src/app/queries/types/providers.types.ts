import { ProviderType } from '@app/common/constants';
import { ICR, IMetaTypeMeta, INameNamespaceRef, IStatusCondition } from '@app/queries/types';

export interface ICommonProviderObject extends ICR {
  spec: {
    type: ProviderType | null;
    url: string; // TODO is this the "Endpoint" column?
    secret: INameNamespaceRef;
  };
  status?: {
    conditions: IStatusCondition[];
    observedGeneration: number;
  };
}

export interface INewSecret extends IMetaTypeMeta {
  data: {
    user?: string;
    password?: string;
    thumbprint?: string;
    token?: string;
  };
  metadata: {
    generateName: string;
    namespace: string;
    labels: {
      createdForResourceType: string;
      createdForResource: string;
    };
  };
  type: string;
}

export interface ICommonProvider {
  uid: string;
  version: string;
  namespace: string;
  name: string;
  selfLink: string;
  type: ProviderType;
  object: ICommonProviderObject;
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
  name: string;
  network: IHostNetwork;
  bandwidth: string;
  mtu: number;
}

export interface IProvidersByType {
  [ProviderType.vsphere]: IVMwareProvider[];
  [ProviderType.openshift]: IOpenShiftProvider[];
}

export interface ISrcDestRefs {
  source: INameNamespaceRef;
  destination: INameNamespaceRef;
}
