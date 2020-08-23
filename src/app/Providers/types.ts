export interface IStatusCondition {
  type: string;
  status: string;
  category: string;
  message: string;
  lastTransitionTime: string; // ISO timestamp
}

export interface ICommonProviderMetadata {
  name: string;
  namespace: string;
  selfLink: string;
  uid: string;
  resourceVersion: string;
  generation: number;
  creationTimestamp: string; // ISO timestamp
  annotations?: {
    'kubectl.kubernetes.io/last-applied-configuration': string; // JSON
  };
}

export interface ICNVProviderMetadata extends ICommonProviderMetadata {
  storageClasses: string[]; // TODO ???
}

export interface ICommonProvider {
  metadata: ICommonProviderMetadata;
  spec: {
    type: string;
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

// TODO these resourceCounts interfaces are speculative
// need to look at the real structure once Jeff implements this part

export interface IVMWareProvider extends ICommonProvider {
  resourceCounts: {
    numClusters: number;
    numHosts: number;
    numVMs: number;
    numNetworks: number;
    numDatastores: number;
  };
}

export interface ICNVProvider extends ICommonProvider {
  metadata: ICNVProviderMetadata;
  resourceCounts: {
    numNamespaces: number;
    numVMs: number;
    numNetworks: number;
  };
}

export type Provider = IVMWareProvider | ICNVProvider;

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

export interface IHostsByProvider {
  [providerName: string]: IHost[];
}
