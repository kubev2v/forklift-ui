import {
  LoginData,
  MappingData,
  MappingPeer,
  PlanData,
  TestData,
  VmwareProviderData,
  HookData,
  esxiHostList,
} from '../../types/types';
import { providerType, storageType } from '../../types/constants';
const url = Cypress.env('url');
const user_login = 'kubeadmin';
const user_password = Cypress.env('pass');
const v2v_vmware_providername = Cypress.env('v2v_vmware_providername');
const v2v_vmware_username = Cypress.env('v2v_vmware_username');
const v2v_vmware_password = Cypress.env('v2v_vmware_password');
const v2v_vmware_hostname = Cypress.env('v2v_vmware_hostname');
const v2v_vmware_vddkImage = Cypress.env('v2v_vmware_vddkImage');
const vmwareClusterName = Cypress.env('v2v_vmwareClusterName');
const sourceProviderStorage = Cypress.env('v2v_vmwareStorageSource');
const vmListArray = Cypress.env('vm_list');
const preAnsiblePlaybook = Cypress.env('preAnsiblePlaybook');
const postAnsiblePlaybook = Cypress.env('postAnsiblePlaybook');
const target_network = Cypress.env('v2v_vmwareTargetNetwork');
const hostListArray = Cypress.env('host_list');
const esxi_username = Cypress.env('v2v_vmwareEsxiUsername');
const esxi_password = Cypress.env('v2v_vmwareEsxiPassword');

export const loginData: LoginData = {
  username: user_login,
  password: user_password,
  url: url,
};

//For ESXI HOST Credentials
export const hostList: esxiHostList = {
  hostnames: hostListArray,
  targetNetwork: target_network,
  esxiUsername: esxi_username,
  esxiPassword: esxi_password,
};
export const providerData: VmwareProviderData = {
  type: providerType.vmware,
  name: v2v_vmware_providername,
  hostname: v2v_vmware_hostname,
  username: v2v_vmware_username,
  password: v2v_vmware_password,
  image: v2v_vmware_vddkImage,
  esxiHostList: hostList,
};

export const networkMappingPeer: MappingPeer[] = [
  {
    sProvider: 'VM Network',
    dProvider: 'Pod network',
  },
  {
    sProvider: 'Mgmt Network',
    dProvider: 'default / mybridge',
  },
];

export const storageMappingPeer: MappingPeer[] = [
  {
    sProvider: sourceProviderStorage,
    dProvider: storageType.nfs,
  },
];

export const networkMapping: MappingData = {
  name: `network-${providerData.name}-mapping`,
  sProviderName: providerData.name,
  tProviderName: 'host',
  mappingPeer: networkMappingPeer,
};

export const storageMapping: MappingData = {
  name: `storage-${providerData.name}-mapping`,
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

export const editNetworkMapping: MappingData = {
  name: `network-${providerData.name}-mapping`,
  sProviderName: providerData.name,
  tProviderName: 'host',
  mappingPeer: [
    {
      sProvider: 'Mgmt Network',
      dProvider: 'default / ovn-kubernetes1',
    },
  ],
};

export const editStorageMapping: MappingData = {
  name: `storage-${providerData.name}-mapping`,
  sProviderName: providerData.name,
  tProviderName: 'host',
  mappingPeer: [
    {
      sProvider: 'v2v_general_porpuse_FC_DC',
      dProvider: storageType.cephRbd,
    },
  ],
};

export const originalPlanData: PlanData = {
  name: `testplan-${providerData.name}separate-mapping-cold`,
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
