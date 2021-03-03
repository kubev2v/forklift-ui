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

export const loginData: LoginData = {
  username: user_login,
  password: user_password,
  url: url,
};

export const providerData: VmwareProviderData = {
  type: vmware,
  name: 'boston-vmware',
  hostname: 'vcenter.v2v.bos.redhat.com',
  username: 'administrator@vsphere.local',
  password: '100Mgmt-',
  cert: '39:5C:6A:2D:36:38:B2:52:2B:21:EA:74:11:59:89:5E:20:D5:D9:A2',
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
