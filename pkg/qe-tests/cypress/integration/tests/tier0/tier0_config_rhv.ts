import {
  HookData,
  LoginData,
  MappingData,
  MappingPeer,
  PlanData,
  RhvProviderData,
  TestData,
  // HookData,
} from '../../types/types';
import { providerType, storageType } from '../../types/constants';

//Defining URL and credentials for target cluster
const url = Cypress.env('url');
const user_login = 'kubeadmin';
const user_password = Cypress.env('pass');

/**
 * Starting RHV section
 **/
//Getting required env variables for RHV
const v2v_rhv_providername = Cypress.env('v2v_rhv_providername');
const v2v_rhv_username = Cypress.env('v2v_rhv_username');
const v2v_rhv_password = Cypress.env('v2v_rhv_password');
const v2v_rhv_hostname = Cypress.env('v2v_rhv_hostname');
const v2v_rhv_clustername = Cypress.env('v2v_rhv_clustername');
const v2v_rhv_cert = Cypress.env('v2v_rhv_cert');
const vmListArray = Cypress.env('vm_list');
const warmVmListArray = Cypress.env('warm_vm_list');
const preAnsiblePlaybook = Cypress.env('preAnsiblePlaybook');
const postAnsiblePlaybook = Cypress.env('postAnsiblePlaybook');
const targetNamespace = 'tier0';

// Defining data required for login
export const loginData: LoginData = {
  username: user_login,
  password: user_password,
  url: url,
};

//Defining RHV provider
export const rhvProvider: RhvProviderData = {
  type: providerType.rhv,
  name: v2v_rhv_providername,
  hostname: v2v_rhv_hostname,
  username: v2v_rhv_username,
  password: v2v_rhv_password,
  cert: v2v_rhv_cert,
};

//Defining RHV network mapping peers for 2 networks
export const rhvNetworkMappingPeer_2x_network: MappingPeer[] = [
  {
    sProvider: 'ovirtmgmt',
    dProvider: 'Pod network',
  },
  {
    sProvider: 'vm',
    dProvider: `${targetNamespace} / mybridge`,
  },
];

//Defining RHV storage mapping peer for NFS
export const rhvStorageMappingPeer_nfs: MappingPeer[] = [
  {
    sProvider: 'v2v-fc',
    dProvider: storageType.nfs,
  },
];

//Defining RHV storage mapping peer for ceph-rbd
export const rhvStorageMappingPeer_ceph: MappingPeer[] = [
  {
    sProvider: 'v2v-fc',
    dProvider: storageType.cephRbd,
  },
];

//Defining RHV network mapping using 2 peers
export const rhvNetworkMapping_2x_network: MappingData = {
  name: `network-${rhvProvider.name}-mapping`,
  sProviderName: rhvProvider.name,
  tProviderName: 'host',
  mappingPeer: rhvNetworkMappingPeer_2x_network,
};

//Defining RHV storage mapping for ceph-rbd file system
export const rhvStorageMapping_ceph: MappingData = {
  name: `storage-ceph-${rhvProvider.name}-mapping`,
  sProviderName: rhvProvider.name,
  tProviderName: 'host',
  mappingPeer: rhvStorageMappingPeer_ceph,
};

//Defining RHV storage mapping for NFS file system
export const rhvStorageMapping_nfs: MappingData = {
  name: `storage-nfs-${rhvProvider.name}-mapping`,
  sProviderName: rhvProvider.name,
  tProviderName: 'host',
  mappingPeer: rhvStorageMappingPeer_nfs,
};

export const preHookData: HookData = {
  ansiblePlaybook: preAnsiblePlaybook,
};

export const postHookData: HookData = {
  ansiblePlaybook: postAnsiblePlaybook,
};

//Defining RHV cold migration plan for ceph-rbd file system
export const rhvTier0Plan_ceph_cold: PlanData = {
  name: `rhv-tier0-ceph-${rhvProvider.name}`,
  sProvider: rhvProvider.name,
  tProvider: 'host',
  namespace: targetNamespace,
  sourceClusterName: v2v_rhv_clustername,
  vmList: vmListArray,
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: rhvProvider,
  networkMappingData: rhvNetworkMapping_2x_network,
  storageMappingData: rhvStorageMapping_ceph,
  warmMigration: false,
  preHook: preHookData,
  postHook: postHookData,
};

//Defining RHV cold migration plan for NFS file system
export const rhvTier0Plan_nfs_cold: PlanData = {
  name: `rhv-tier0-nfs-${rhvProvider.name}`,
  sProvider: rhvProvider.name,
  tProvider: 'host',
  namespace: targetNamespace,
  sourceClusterName: v2v_rhv_clustername,
  vmList: vmListArray,
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: rhvProvider,
  networkMappingData: rhvNetworkMapping_2x_network,
  storageMappingData: rhvStorageMapping_nfs,
  warmMigration: false,
};

//Defining RHV warm migration plan for NFS file system
export const rhvTier0Plan_nfs_warm: PlanData = {
  name: `rhv-tier0-nfs-${rhvProvider.name}`,
  sProvider: rhvProvider.name,
  tProvider: 'host',
  namespace: targetNamespace,
  sourceClusterName: v2v_rhv_clustername,
  vmList: warmVmListArray,
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: rhvProvider,
  networkMappingData: rhvNetworkMapping_2x_network,
  storageMappingData: rhvStorageMapping_nfs,
  warmMigration: true,
};

//Defining RHV warm migration plan for ceph-rbd file system
export const rhvTier0Plan_ceph_warm: PlanData = {
  name: `rhv-tier0-ceph-${rhvProvider.name}`,
  sProvider: rhvProvider.name,
  tProvider: 'host',
  namespace: targetNamespace,
  sourceClusterName: v2v_rhv_clustername,
  vmList: warmVmListArray,
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: rhvProvider,
  networkMappingData: rhvNetworkMapping_2x_network,
  storageMappingData: rhvStorageMapping_ceph,
  warmMigration: true,
};

//Defining test for RHV cold migration with ceph-rbd file system
export const rhvTier0TestCephCold: TestData = {
  loginData: loginData,
  planData: rhvTier0Plan_ceph_cold,
};

//Defining test for RHV cold migration with nfs file system
export const rhvTier0TestNfsCold: TestData = {
  loginData: loginData,
  planData: rhvTier0Plan_nfs_cold,
};

//Defining test for RHV warm migration with ceph-rbd file system
export const rhvTiesr0TestCephWarm: TestData = {
  loginData: loginData,
  planData: rhvTier0Plan_ceph_warm,
};

//Defining test for RHV warm migration with nfs file system
export const rhvTier0TestNfsWarm: TestData = {
  loginData: loginData,
  planData: rhvTier0Plan_nfs_warm,
};

export const rhvTier0TestArray = [
  rhvTier0TestCephCold,
  // rhvTier0TestNfsCold,
  rhvTiesr0TestCephWarm,
  // rhvTier0TestNfsWarm,
];
