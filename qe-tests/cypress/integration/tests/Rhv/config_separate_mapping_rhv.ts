import {
  LoginData,
  MappingData,
  MappingPeer,
  PlanData,
  TestData,
  RhvProviderData,
} from '../../types/types';
import { providerType, storageType } from '../../types/constants';
const url = Cypress.env('url');
const user_login = 'kubeadmin';
const user_password = Cypress.env('pass');
const v2v_rhv_username = Cypress.env('v2v_rhv_username');
const v2v_rhv_password = Cypress.env('v2v_rhv_password');
const v2v_rhv_hostname = Cypress.env('v2v_rhv_hostname');
const v2v_rhv_cert = Cypress.env('v2v_rhv_cert');
const ansible_playbook = Cypress.env('ansible_playbook');

export const loginData: LoginData = {
  username: user_login,
  password: user_password,
  url: url,
};

export const providerData: RhvProviderData = {
  type: providerType.rhv,
  name: 'qe-rhv',
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
  {
    sProvider: 'hosted_storage',
    dProvider: storageType.nfs,
  },
];

export const networkMapping: MappingData = {
  name: 'network-qe-rhv-mapping',
  sProviderName: providerData.name,
  tProviderName: 'host',
  mappingPeer: networkMappingPeer,
};

export const storageMapping: MappingData = {
  name: 'storage-qe-rhv-mapping',
  sProviderName: providerData.name,
  tProviderName: 'host',
  mappingPeer: storageMappingPeer,
};

export const planData: PlanData = {
  name: 'testplan-rhv-rhel8-separate-mapping-cold',
  sProvider: providerData.name,
  tProvider: 'host',
  namespace: 'default',
  sourceClusterName: 'MTV',
  vmwareSourceVmList: ['v2v-migration-rhel8-2disks2nics'],
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: providerData,
  networkMappingData: networkMapping,
  storageMappingData: storageMapping,
  warmMigration: false,
  ansiblePlaybook: ansible_playbook,
};

export const testData: TestData = {
  loginData: loginData,
  planData: planData,
};
