import {
  LoginData,
  MappingData,
  MappingPeer,
  PlanData,
  TestData,
  VmwareProviderData,
  HookData,
} from '../../types/types';
import { providerType, storageType } from '../../types/constants';
const url = Cypress.env('url');
const user_login = 'kubeadmin';
const user_password = Cypress.env('pass');
const v2v_vmware_providername = Cypress.env('v2v_vmware_providername');
const v2v_vmware_username = Cypress.env('v2v_vmware_username');
const v2v_vmware_password = Cypress.env('v2v_vmware_password');
const v2v_vmware_hostname = Cypress.env('v2v_vmware_hostname');
const v2v_vmware_cert = Cypress.env('v2v_vmware_cert');
const vmwareClusterName = Cypress.env('v2v_vmwareClusterName');
const sourceProviderStorage = Cypress.env('v2v_vmwareStorageSource');
const vmListArray = Cypress.env('vm_list');
const preAnsiblePlaybook = Cypress.env('preAnsiblePlaybook');
const postAnsiblePlaybook = Cypress.env('postAnsiblePlaybook');

export const loginData: LoginData = {
  username: user_login,
  password: user_password,
  url: url,
};

export const providerData: VmwareProviderData = {
  type: providerType.vmware,
  name: v2v_vmware_providername,
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
    sProvider: sourceProviderStorage,
    dProvider: storageType.cephRbd,
  },
];

export const networkMapping: MappingData = {
  name: 'network-qe-vmware-mapping',
  sProviderName: providerData.name,
  tProviderName: 'host',
  mappingPeer: networkMappingPeer,
};

export const storageMapping: MappingData = {
  name: 'storage-qe-vmware-mapping',
  sProviderName: providerData.name,
  tProviderName: 'host',
  mappingPeer: storageMappingPeer,
};

export const preHookData: HookData = {
  ansiblePlaybook: preAnsiblePlaybook,
};

export const postHookData: HookData = {
  ansiblePlaybook: postAnsiblePlaybook,
};

export const originalPlanData: PlanData = {
  name: 'testplan-separate-mapping-cold',
  sProvider: providerData.name,
  tProvider: 'host',
  namespace: 'default',
  sourceClusterName: vmwareClusterName,
  vmList: vmListArray,
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: providerData,
  networkMappingData: networkMapping,
  storageMappingData: storageMapping,
  warmMigration: false,
  preHook: preHookData,
  postHook: postHookData,
  migrationOcpNetwork: 'OCP default network',
};

export const duplicatePlanData: PlanData = {
  name: 'copy-of-testplan-separate-mapping-cold',
  sProvider: providerData.name,
  tProvider: 'host',
  namespace: 'openshift-mtv',
  sourceClusterName: vmwareClusterName,
  vmList: ['v2v-rhel7-2nic-2disk-igor'],
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: providerData,
  networkMappingData: networkMapping,
  storageMappingData: storageMapping,
  warmMigration: false,
  preHook: preHookData,
  postHook: postHookData,
};

export const duplicateTestData: TestData = {
  loginData: loginData,
  planData: duplicatePlanData,
};

export const testData: TestData = {
  loginData: loginData,
  planData: originalPlanData,
};
