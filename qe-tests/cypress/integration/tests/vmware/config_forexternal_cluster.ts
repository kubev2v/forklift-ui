import {
  LoginData,
  MappingData,
  PlanData,
  TestData,
  OcpVirtData,
  VmwareProviderData,
  MappingPeer,
} from '../../types/types';
import { providerType, storageType } from '../../types/constants';

const url = Cypress.env('url');
const user_login = 'kubeadmin';
const user_password = Cypress.env('pass');

export const loginData: LoginData = {
  username: user_login,
  password: user_password,
  url: url,
};

export const target_ocpData: OcpVirtData = {
  type: 'OpenShift Virtualization',
  name: 'mgn01',
  url: 'https://api.mgn01.cnv-qe.rhcloud.com:6443',
  //saToken: 'sha256~i3ZkqZC5P41Vs3SWSyL7Z1hnF4vifp-4CTKqsasXW6s',
  saToken: 'sha256~QM4Ak3TvLuvyB52QR-3nSMZCTVCr7ujQ_TU6BJyt4tA',
};

export const source_vmwareData: VmwareProviderData = {
  type: providerType.vmware,
  name: 'qe-vmware',
  hostname: '10.8.58.136',
  username: 'administrator@vsphere.local',
  password: 'Tux4Linux!',
  cert: '7E:E7:4C:5C:3C:0E:51:D2:D7:8B:89:F1:DF:0A:9E:A5:D6:13:98:F6',
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
  tProviderName: 'mgn01',
  mappingPeer: networkMappingPeer,
};

export const storageMappingData: MappingData = {
  name: 'storage-qe-vmware-mapping',
  sProviderName: 'qe-vmware',
  tProviderName: 'mgn01',
  mappingPeer: storageMappingPeer,
};
export const planData: PlanData = {
  name: 'testplan',
  sProvider: source_vmwareData.name,
  tProvider: 'mgn01',
  namespace: 'default',
  vmwareSourceFqdn: 'smicro-5037-08.cfme.lab.eng.rdu2.redhat.com',
  vmwareSourceVmList: ['v2v-rhel7-igor'],
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: source_vmwareData,
  targetprovider: target_ocpData,
  networkMappingData: networkMappingData,
  storageMappingData: storageMappingData,
};

export const tData: TestData = {
  loginData: loginData,
  planData: planData,
};
