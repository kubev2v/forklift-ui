export type LoginData = {
  username: string;
  password: string;
  url: string;
};

export type MappingPeer = {
  sProvider: string;
  dProvider: string;
};

export type MappingData = {
  name: string;
  sProviderName: string;
  tProviderName: string;
  mappingPeer: MappingPeer[];
};

export type VmwareProviderData = {
  type: string;
  name: string;
  hostname?: string;
  username?: string;
  password?: string;
  cert?: string;
};

export type RhvProviderData = {
  type: string;
  name: string;
  hostname?: string;
  username?: string;
  password?: string;
  cert?: string;
};

export type OcpVirtData = {
  type: string;
  name: string;
  url?: string;
  saToken?: string;
};

export type ProviderData = VmwareProviderData | RhvProviderData | OcpVirtData;

export type PlanData = {
  name: string;
  description?: string;
  sProvider: string;
  tProvider: string;
  namespace: string;
  sourceClusterName: string;
  vmwareSourceVmList: string[];
  useExistingNetworkMapping: boolean;
  useExistingStorageMapping: boolean;
  providerData: ProviderData;
  targetProvider?: ProviderData;
  networkMappingData: MappingData;
  storageMappingData: MappingData;
  warmMigration?: boolean;
};
export type TestData = {
  loginData: LoginData;
  planData: PlanData;
  timeout?: number;
};
