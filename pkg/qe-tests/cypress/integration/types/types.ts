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
export type esxiHostList = {
  hostnames: string[];
  targetNetwork: string;
  esxiUsername: string;
  esxiPassword: string;
};

export type VmwareProviderData = {
  type: string;
  name: string;
  hostname?: string;
  username?: string;
  password?: string;
  esxiHostList?: esxiHostList;
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
  vmList: string[];
  useExistingNetworkMapping: boolean;
  useExistingStorageMapping: boolean;
  providerData: ProviderData;
  targetProvider?: ProviderData;
  networkMappingData: MappingData;
  storageMappingData: MappingData;
  warmMigration?: boolean;
  preHook?: HookData;
  postHook?: HookData;
  migrationOcpNetwork?: string;
};

export type HookData = {
  ansiblePlaybook?: string;
  image?: string;
};

export type TestData = {
  loginData: LoginData;
  planData: PlanData;
  timeout?: number;
};
