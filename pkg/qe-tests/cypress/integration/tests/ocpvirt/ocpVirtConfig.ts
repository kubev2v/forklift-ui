import {
  LoginData,
  MappingData,
  PlanData,
  TestData,
  OcpVirtData,
  MappingPeer,
  HookData,
} from '../../types/types';
import { storageType } from '../../types/constants';

const url = Cypress.env('url');
const user_login = 'kubeadmin';
const user_password = Cypress.env('pass');
const migration_network = Cypress.env('network');
const preAnsiblePlaybook = Cypress.env('preAnsiblePlaybook');
const postAnsiblePlaybook = Cypress.env('postAnsiblePlaybook');

export const loginData: LoginData = {
  username: user_login,
  password: user_password,
  url: url,
};

export const providerData: OcpVirtData = {
  type: 'OpenShift Virtualization',
  name: 'mig04',
  url: 'https://api.mig04.cnv-qe.rhcloud.com:6443',
  saToken: 'sha256~uDxw4ub5I6QvBtsvHatF1vit36YjexnRduc4pi-FVuc',
  migrationNetwork: migration_network,
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

export const preHookData: HookData = {
  ansiblePlaybook: preAnsiblePlaybook,
};

export const postHookData: HookData = {
  ansiblePlaybook: postAnsiblePlaybook,
};

export const planData: PlanData = {
  name: 'testplan',
  sProvider: 'qe-vmware',
  tProvider: providerData.name,
  namespace: 'default',
  sourceClusterName: 'smicro-5037-08.cfme.lab.eng.rdu2.redhat.com',
  vmList: ['v2v-rhel7-igor'],
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: providerData,
  networkMappingData: networkMappingData,
  storageMappingData: storageMappingData,
  preHook: preHookData,
  postHook: postHookData,
  ocpMigrationNetwork: migration_network,
};

export const tData: TestData = {
  loginData: loginData,
  planData: planData,
};
