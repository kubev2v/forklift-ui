export type LoginData = {
  username: string;
  password: string;
  url: string;
};

export type MappingData = {
  name: string;
  sProviderName: string;
  tProviderName: string;
  sProvider: string;
  dProvider: string;
};

export type VmwareProviderData = {
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

export type ProviderData = VmwareProviderData | OcpVirtData;

export type PlanData = {
  name: string;
  description?: string;
  sProvider: string;
  tProvider: string;
  namespace: string;
  vmwareSourceFqdn: string;
  vmwareSourceVmList: string[];
  useExistingNetworkMapping: boolean;
  useExistingStorageMapping: boolean;
  providerData: ProviderData;
  networkMappingData: MappingData;
  storageMappingData: MappingData;
};
export type TestData = {
  loginData: LoginData;
  planData: PlanData;
};
