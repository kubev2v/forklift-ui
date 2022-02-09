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
const saToken = Cypress.env('token');

export const loginData: LoginData = {
  username: user_login,
  password: user_password,
  url: url,
};

export const providerData: OcpVirtData = {
  type: 'OpenShift Virtualization',
  name: 'mig04',
  url: 'https://api.mig04.cnv-qe.rhcloud.com:6443',
  saToken: saToken,
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
  ocpMigrationNetwork: migration_network,
};

export const tData: TestData = {
  loginData: loginData,
  planData: planData,
};
