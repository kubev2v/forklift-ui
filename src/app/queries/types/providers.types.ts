import { ProviderType } from '@app/common/constants';
import { ICR, IStatusCondition } from '@app/queries/types';

interface ICommonProviderObject extends ICR {
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
