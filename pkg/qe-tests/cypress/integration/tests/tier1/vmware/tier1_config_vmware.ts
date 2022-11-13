import {
  LoginData,
  MappingData,
  MappingPeer,
  PlanData,
  TestData,
  VmwareProviderData,
  HookData,
  CutoverData,
} from '../../../types/types';
import { providerType, storageType } from '../../../types/constants';

//Defining URL and credentials for target cluster
const url = Cypress.env('url');
const user_login = 'kubeadmin';
const user_password = Cypress.env('pass');

/**
 * Starting VMWare section
 **/
//Getting required env variables for VMWare
const v2v_vmware_provider_name = Cypress.env('v2v_vmware_providername');
const v2v_vmware_username = Cypress.env('v2v_vmware_username');
const v2v_vmware_password = Cypress.env('v2v_vmware_password');
const v2v_vmware_admin_username = Cypress.env('v2v_vmware_admin_username');
const v2v_vmware_admin_password = Cypress.env('v2v_vmware_admin_password');
const v2v_vmware_hostname = Cypress.env('v2v_vmware_hostname');
const vmwareClusterName = Cypress.env('v2v_vmwareClusterName');
const sourceProviderStorage = Cypress.env('v2v_vmwareStorageSource');
const v2v_vmware_vddkImage = Cypress.env('v2v_vmware_vddkImage');
const vmListArray = Cypress.env('vm_list');
const warmVmListArray = Cypress.env('warm_vm_list');
const preAnsiblePlaybook = Cypress.env('preAnsiblePlaybook');
const postAnsiblePlaybook = Cypress.env('postAnsiblePlaybook');
const namespace = 'tier1';

// Defining data required for login
export const loginData: LoginData = {
  username: user_login,
  password: user_password,
  url: url,
};

export const cutoverTime: CutoverData = {
  // date: '2022-05-26',
  // time: '4:30 PM',
  date: '',
  time: '',
};

//Defining VMWare provider
export const vmwareProviderAdmin: VmwareProviderData = {
  type: providerType.vmware,
  name: v2v_vmware_provider_name,
  hostname: v2v_vmware_hostname,
  username: v2v_vmware_admin_username,
  password: v2v_vmware_admin_password,
  image: v2v_vmware_vddkImage,
};

export const vmwareProviderUser: VmwareProviderData = {
  type: providerType.vmware,
  name: v2v_vmware_provider_name,
  hostname: v2v_vmware_hostname,
  username: v2v_vmware_username,
  password: v2v_vmware_password,
  image: v2v_vmware_vddkImage,
};

//Defining vmware network mapping peer of single network
export const vmwareNetworkMappingPeerSingle: MappingPeer[] = [
  {
    sProvider: 'VM Network',
    dProvider: 'Pod network',
  },
];

//Defining vmware network mapping peers for 2 networks
export const vmwareNetworkMappingPeer_2x_network: MappingPeer[] = [
  {
    sProvider: 'VM Network',
    dProvider: 'Pod network',
  },
  {
    sProvider: 'Mgmt Network',
    dProvider: `${namespace} / mybridge`,
  },
];

//Defining vmware storage mapping peer for NFS
export const vmwareStorageMappingPeer_nfs: MappingPeer[] = [];

//Defining vmware storage mapping peer for CEPH
export const vmwareStorageMappingPeer_ceph: MappingPeer[] = [];

sourceProviderStorage.forEach((currentStorage) => {
  // Adding all peers defined in external config
  vmwareStorageMappingPeer_nfs.push({
    sProvider: currentStorage,
    dProvider: storageType.nfs,
  });

  vmwareStorageMappingPeer_ceph.push({
    sProvider: currentStorage,
    dProvider: storageType.cephRbd,
  });
});

//Defining vmware network mapping using 2 peers
export const vmwareNetworkMapping_2x_network: MappingData = {
  name: `network-${vmwareProviderUser.name}-mapping`,
  sProviderName: vmwareProviderUser.name,
  tProviderName: 'host',
  mappingPeer: vmwareNetworkMappingPeer_2x_network,
};

//Defining vmware network mapping using 2 peers
export const vmwareNetworkMappingSingle: MappingData = {
  name: `network-${vmwareProviderUser.name}-mapping`,
  sProviderName: vmwareProviderUser.name,
  tProviderName: 'host',
  mappingPeer: vmwareNetworkMappingPeerSingle,
};

//Defining vmware storage mapping for NFS file system
export const vmwareStorageMapping_nfs: MappingData = {
  name: `storage-nfs-${vmwareProviderUser.name}-mapping`,
  sProviderName: vmwareProviderUser.name,
  tProviderName: 'host',
  mappingPeer: vmwareStorageMappingPeer_nfs,
};

//Defining vmware storage mapping for ceph-rbd file system
export const vmwareStorageMapping_ceph: MappingData = {
  name: `storage-ceph-${vmwareProviderUser.name}-mapping`,
  sProviderName: vmwareProviderUser.name,
  tProviderName: 'host',
  mappingPeer: vmwareStorageMappingPeer_ceph,
};

export const preHookData: HookData = {
  ansiblePlaybook: preAnsiblePlaybook,
};

export const postHookData: HookData = {
  ansiblePlaybook: postAnsiblePlaybook,
};

//Defining vmware cold migration plan for ceph-rbd file system
export const vmwareTier1Plan_ceph_cold: PlanData = {
  name: `a-vmware-tier0-ceph-${vmwareProviderUser.name}-cold`,
  sProvider: vmwareProviderUser.name,
  tProvider: 'host',
  namespace: namespace,
  sourceClusterName: vmwareClusterName,
  vmList: vmListArray,
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: vmwareProviderUser,
  networkMappingData: vmwareNetworkMapping_2x_network,
  storageMappingData: vmwareStorageMapping_ceph,
  warmMigration: false,
  preHook: preHookData,
  postHook: postHookData,
};

export const vmwareTier1Plan_ceph_cold_duplicate: PlanData = {
  name: `a-vmware-tier0-ceph-${vmwareProviderUser.name}-cold-duplicate`,
  sProvider: vmwareProviderUser.name,
  tProvider: 'host',
  namespace: namespace,
  sourceClusterName: vmwareClusterName,
  vmList: vmListArray,
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: vmwareProviderUser,
  networkMappingData: vmwareNetworkMapping_2x_network,
  storageMappingData: vmwareStorageMapping_ceph,
  warmMigration: false,
  preHook: preHookData,
  postHook: postHookData,
};

//Defining vmware warm migration plan for ceph-rbd file system
export const vmwareTier0Plan_ceph_warm: PlanData = {
  name: `a-vmware-tier0-ceph-${vmwareProviderUser.name}-warm`,
  sProvider: vmwareProviderUser.name,
  tProvider: 'host',
  namespace: namespace,
  sourceClusterName: vmwareClusterName,
  vmList: warmVmListArray,
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: vmwareProviderUser,
  networkMappingData: vmwareNetworkMapping_2x_network,
  storageMappingData: vmwareStorageMapping_ceph,
  warmMigration: true,
  preHook: preHookData,
  postHook: postHookData,
  scheduledCutover: cutoverTime,
};

//Defining test for vmware cold migration with ceph-rbd file system
export const vmwareTier1TestCephCold: TestData = {
  loginData: loginData,
  planData: vmwareTier1Plan_ceph_cold,
};

export const vmwareTier1TestCephColdDuplicate: TestData = {
  loginData: loginData,
  planData: vmwareTier1Plan_ceph_cold_duplicate,
};

export const vmwareTier1TestCephWarm: TestData = {
  loginData: loginData,
  planData: vmwareTier0Plan_ceph_warm,
};
