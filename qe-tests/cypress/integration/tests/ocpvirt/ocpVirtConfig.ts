import {
  LoginData,
  MappingData,
  PlanData,
  TestData,
  OcpVirtData,
  MappingPeer,
} from '../../types/types';
import { storageType } from '../../types/constants';

const url = Cypress.env('url');
const user_login = 'kubeadmin';
const user_password = Cypress.env('pass');
const ansible_playbook = Cypress.env('ansible_playbook');

export const loginData: LoginData = {
  username: user_login,
  password: user_password,
  url: url,
};

export const providerData: OcpVirtData = {
  type: 'OpenShift Virtualization',
  name: 'mgn02',
  url: 'https://api.mgn02.cnv-qe.rhcloud.com:6443',
  saToken: 'sha256~i3ZkqZC5P41Vs3SWSyL7Z1hnF4vifp-4CTKqsasXW6s',
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
  vmwareSourceVmList: ['v2v-rhel7-igor'],
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: providerData,
  networkMappingData: networkMappingData,
  storageMappingData: storageMappingData,
  ansiblePlaybook: ansible_playbook,
};

export const tData: TestData = {
  loginData: loginData,
  planData: planData,
};
