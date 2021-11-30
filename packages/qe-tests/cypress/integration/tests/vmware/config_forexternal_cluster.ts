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
const v2v_vmware_username = Cypress.env('v2v_vmware_username');
const v2v_vmware_password = Cypress.env('v2v_vmware_password');
const v2v_vmware_hostname = Cypress.env('v2v_vmware_hostname');
const v2v_vmware_cert = Cypress.env('v2v_vmware_cert');

export const loginData: LoginData = {
  username: user_login,
  password: user_password,
  url: url,
};

export const targetOcpData: OcpVirtData = {
  type: 'OpenShift Virtualization',
  name: 'mgn05',
  url: 'https://api.mgn05.cnv-qe.rhcloud.com:6443',
  saToken: 'sha256~L-klfv9mqOe5UTXMwCeUhNu6w7zZyDnFzrjK0x2U5M8',
};

export const sourceVmwareData: VmwareProviderData = {
  type: providerType.vmware,
  name: 'qe-vmware',
  hostname: v2v_vmware_hostname,
  username: v2v_vmware_username,
  password: v2v_vmware_password,
  cert: v2v_vmware_cert,
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
  tProviderName: 'mgn05',
  mappingPeer: networkMappingPeer,
};

export const storageMappingData: MappingData = {
  name: 'storage-qe-vmware-mapping',
  sProviderName: 'qe-vmware',
  tProviderName: 'mgn05',
  mappingPeer: storageMappingPeer,
};
export const planData: PlanData = {
  name: 'testplan',
  sProvider: sourceVmwareData.name,
  tProvider: 'mgn05',
  namespace: 'default',
  sourceClusterName: 'smicro-5037-08.cfme.lab.eng.rdu2.redhat.com',
  vmwareSourceVmList: ['v2v-rhel7-igor'],
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: sourceVmwareData,
  targetProvider: targetOcpData,
  networkMappingData: networkMappingData,
  storageMappingData: storageMappingData,
};

export const tData: TestData = {
  loginData: loginData,
  planData: planData,
};
