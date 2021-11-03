import {
  LoginData,
  MappingData,
  MappingPeer,
  PlanData,
  TestData,
  VmwareProviderData,
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

export const providerData: VmwareProviderData = {
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
  {
    sProvider: 'Mgmt Network',
    dProvider: 'default / ovn-kubernetes1',
  },
];

export const storageMappingPeer: MappingPeer[] = [
  {
    sProvider: 'v2v_general_porpuse_ISCSI_DC',
    dProvider: storageType.nfs,
  },
];

export const networkMapping: MappingData = {
  name: 'network-qe-vmware-mapping',
  sProviderName: 'qe-vmware',
  tProviderName: 'host',
  mappingPeer: networkMappingPeer,
};

export const storageMapping: MappingData = {
  name: 'storage-qe-vmware-mapping',
  sProviderName: providerData.name,
  tProviderName: 'host',
  mappingPeer: storageMappingPeer,
};

export const planData: PlanData = {
  name: 'testplan-separate-mapping-cold',
  sProvider: providerData.name,
  tProvider: 'host',
  namespace: 'default',
  sourceClusterName: 'MTV_7.0',
  vmwareSourceVmList: ['v2v-rhel7-2nic-2disk-igor'],
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: providerData,
  networkMappingData: networkMapping,
  storageMappingData: storageMapping,
  warmMigration: false,
};

export const testData: TestData = {
  loginData: loginData,
  planData: planData,
};
