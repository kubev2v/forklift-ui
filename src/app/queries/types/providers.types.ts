import { ProviderType } from '@app/common/constants';
import { ICR, INameNamespaceRef, IStatusCondition } from '@app/queries/types';

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

export interface ICorrelatedProvider<T extends InventoryProvider> extends IProviderObject {
  inventory: T | null;
}

export interface ISrcDestRefs {
  source: INameNamespaceRef;
  destination: INameNamespaceRef;
}
