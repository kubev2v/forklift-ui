import {
  LoginData,
  MappingData,
  MappingPeer,
  PlanData,
  TestData,
  VmwareProviderData,
} from '../../types/types';
import { storageType, vmware } from '../../types/constants';
const url = Cypress.env('url');
const user_login = 'kubeadmin';
const user_password = Cypress.env('pass');
const v2v_vmware_username = Cypress.env('v2v_vmware_username');
const v2v_vmware_password = Cypress.env('v2v_vmware_password');
const v2v_vmware_hostname = Cypress.env('v2v_vmware_hostname');

export const loginData: LoginData = {
  username: user_login,
  password: user_password,
  url: url,
};

export const providerData: VmwareProviderData = {
  type: vmware,
  name: 'boston-vmware',
  hostname: v2v_vmware_hostname,
  username: v2v_vmware_username,
  password: v2v_vmware_password,
};

export const networkMappingPeer: MappingPeer[] = [
  {
    sProvider: 'VM Network',
    dProvider: 'Pod network',
  },
];

export const storageMappingPeer: MappingPeer[] = [
  {
    sProvider: 'env-esxi67-ims-h02_localdisk',
    dProvider: storageType.cephRbd,
  },
];

export const networkMappingData: MappingData = {
  name: 'network-qe-vmware-mapping',
  sProviderName: 'qe-vmware',
  tProviderName: 'host',
  mappingPeer: networkMappingPeer,
};

export const storageMappingData: MappingData = {
  name: 'storage-qe-vmware-mapping',
  sProviderName: providerData.name,
  tProviderName: 'host',
  mappingPeer: storageMappingPeer,
};

export const planData: PlanData = {
  name: 'testplan',
  sProvider: providerData.name,
  tProvider: 'host',
  namespace: 'default',
  sourceClusterName: 'smicro-5037-08.cfme.lab.eng.rdu2.redhat.com',
  vmList: ['v2v-rhel7-igor'],
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
