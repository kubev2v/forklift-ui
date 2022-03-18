import {
  LoginData,
  MappingData,
  MappingPeer,
  PlanData,
  TestData,
  RhvProviderData,
  HookData,
} from '../../types/types';
import { providerType, storageType } from '../../types/constants';
const url = Cypress.env('url');
const user_login = 'kubeadmin';
const user_password = Cypress.env('pass');
const v2v_rhv_providername = Cypress.env('v2v_rhv_providername');
const v2v_rhv_username = Cypress.env('v2v_rhv_username');
const v2v_rhv_password = Cypress.env('v2v_rhv_password');
const v2v_rhv_hostname = Cypress.env('v2v_rhv_hostname');
const v2v_rhv_clustername = Cypress.env('v2v_rhv_clustername');
const v2v_rhv_cert = Cypress.env('v2v_rhv_cert');
const preAnsiblePlaybook = Cypress.env('preAnsiblePlaybook');
const postAnsiblePlaybook = Cypress.env('postAnsiblePlaybook');

export const loginData: LoginData = {
  username: user_login,
  password: user_password,
  url: url,
};

export const providerData: RhvProviderData = {
  type: providerType.rhv,
  name: v2v_rhv_providername,
  hostname: v2v_rhv_hostname,
  username: v2v_rhv_username,
  password: v2v_rhv_password,
  cert: v2v_rhv_cert,
};
export const networkMappingPeer: MappingPeer[] = [
  {
    sProvider: 'ovirtmgmt',
    dProvider: 'Pod network',
  },
  {
    sProvider: 'vm',
    dProvider: 'default / ovn-kubernetes1',
  },
];

export const storageMappingPeer: MappingPeer[] = [
  {
    sProvider: 'v2v-fc',
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
      sProvider: 'vm',
      dProvider: 'default /mybridge ',
    },
  ],
};

export const editStorageMapping: MappingData = {
  name: `storage-${providerData.name}-mapping`,
  sProviderName: providerData.name,
  tProviderName: 'host',
  mappingPeer: [
    {
      sProvider: 'v2v-iscsi',
      dProvider: storageType.cephRbd,
    },
  ],
};

export const originalPlanData: PlanData = {
  name: 'testplan-rhv-rhel8-separate-mapping-cold',
  sProvider: providerData.name,
  tProvider: 'host',
  namespace: 'default',
  sourceClusterName: v2v_rhv_clustername,
  vmList: ['v2v-karishma-rhel8-2disks2nics-vm'],
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
  name: 'copy-of-testplan-rhv-rhel8-separate-mapping-cold',
  sProvider: providerData.name,
  tProvider: 'host',
  namespace: 'openshift-mtv', //another namespace
  sourceClusterName: 'MTV',
  vmList: ['v2v-karishma-rhel8-2disks2nics-vm'],
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
