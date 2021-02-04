import { LoginData, MappingData, PlanData, ProviderData, TestData } from '../types/types';
import { vmware } from '../types/constants';
const url = Cypress.env('url');
const user_login = 'kubeadmin';
const user_password = Cypress.env('pass');

export const loginData: LoginData = {
  username: user_login,
  password: user_password,
  url: url,
};

export const providerData: ProviderData = {
  type: vmware,
  name: 'qe-vmware',
  hostname: '10.8.58.136',
  username: 'administrator@vsphere.local',
  password: 'Tux4Linux!',
  cert: '7E:E7:4C:5C:3C:0E:51:D2:D7:8B:89:F1:DF:0A:9E:A5:D6:13:98:F6',
};

export const networkMappingData: MappingData = {
  name: 'network-qe-vmware-mapping',
  sProviderName: 'qe-vmware',
  tProviderName: 'host',
  sProvider: 'VM Network',
  dProvider: 'Pod network',
};

export const storageMappingData: MappingData = {
  name: 'storage-qe-vmware-mapping',
  sProviderName: providerData.name,
  tProviderName: 'host',
  sProvider: 'env-esxi67-ims-h02_localdisk',
  dProvider: 'nfs',
};

export const planData: PlanData = {
  name: 'testplan',
  sProvider: providerData.name,
  tProvider: 'host',
  namespace: 'default',
  vmwareSourceFqdn: 'smicro-5037-08.cfme.lab.eng.rdu2.redhat.com',
  vmwareSourceVmList: ['v2v-rhel7-igor'],
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: providerData,
  networkMappingData: networkMappingData,
  storageMappingData: storageMappingData,
};

export const testData: TestData = {
  loginData: loginData,
  planData: planData,
};
