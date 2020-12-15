import { ProviderType } from '@app/common/constants';
import {
  ICR,
  IMetaTypeMeta,
  INameNamespaceRef,
  IObjectReference,
  IStatusCondition,
} from '@app/queries/types';

export interface IProviderObject extends ICR {
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

export interface INewSecret extends IMetaTypeMeta {
  data: {
    user?: string;
    password?: string;
    thumbprint?: string;
    token?: string;
  };
  metadata: {
    name?: string;
    generateName?: string;
    namespace: string;
    labels: {
      createdForResourceType: string;
      createdForResource: string;
    };
    ownerReferences?: IObjectReference[];
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

export interface IOpenShiftProvider extends ICommonProvider {
  vmCount: number;
  networkCount: number;
  namespaceCount: number;
}

export type InventoryProvider = IVMwareProvider | IOpenShiftProvider;

export interface IProvidersByType {
  [ProviderType.vsphere]: IVMwareProvider[];
  [ProviderType.openshift]: IOpenShiftProvider[];
}

export interface ISrcDestRefs {
  source: INameNamespaceRef;
  destination: INameNamespaceRef;
}
