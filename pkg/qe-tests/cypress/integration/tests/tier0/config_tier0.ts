import {
  LoginData,
  MappingData,
  MappingPeer,
  PlanData,
  RhvProviderData,
  TestData,
  VmwareProviderData,
  HookData,
} from '../../types/types';
import { providerType, storageType } from '../../types/constants';

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
const v2v_vmware_hostname = Cypress.env('v2v_vmware_hostname');
const vmwareClusterName = Cypress.env('v2v_vmwareClusterName');
const sourceProviderStorage = Cypress.env('v2v_vmwareStorageSource');
const v2v_vmware_vddkImage = Cypress.env('v2v_vmware_vddkImage');
const vmListArray = Cypress.env('vm_list');
const preAnsiblePlaybook = Cypress.env('preAnsiblePlaybook');
const postAnsiblePlaybook = Cypress.env('postAnsiblePlaybook');
const namespace = 'default';

// Defining data required for login
export const loginData: LoginData = {
  username: user_login,
  password: user_password,
  url: url,
};

//Defining VMWare provider
export const vmwareProvider: VmwareProviderData = {
  type: providerType.vmware,
  name: v2v_vmware_provider_name,
  hostname: v2v_vmware_hostname,
  username: v2v_vmware_username,
  password: v2v_vmware_password,
  image: v2v_vmware_vddkImage,
};

//Defining vmware network mapping peers for 2 networks
export const vmwareNetworkMappingPeer_2x_network: MappingPeer[] = [
  {
    sProvider: 'VM Network',
    dProvider: 'Pod network',
  },
  {
    sProvider: 'Mgmt Network',
    dProvider: 'default / mybridge',
  },
];

//Defining vmware storage mapping peer for NFS
export const vmwareStorageMappingPeer_nfs: MappingPeer[] = [
  {
    sProvider: sourceProviderStorage,
    dProvider: storageType.nfs,
  },
];

//Defining vmware storage mapping peer for CEPH
export const vmwareStorageMappingPeer_ceph: MappingPeer[] = [
  {
    sProvider: sourceProviderStorage,
    dProvider: storageType.cephRbd,
  },
];

//Defining vmware network mapping using 2 peers
export const vmwareNetworkMapping_2x_network: MappingData = {
  name: `network-${vmwareProvider.name}-mapping`,
  sProviderName: vmwareProvider.name,
  tProviderName: 'host',
  mappingPeer: vmwareNetworkMappingPeer_2x_network,
};

//Defining vmware storage mapping for NFS file system
export const vmwareStorageMapping_nfs: MappingData = {
  name: `storage-nfs-${vmwareProvider.name}-mapping`,
  sProviderName: vmwareProvider.name,
  tProviderName: 'host',
  mappingPeer: vmwareStorageMappingPeer_nfs,
};

//Defining vmware storage mapping for ceph-rbd file system
export const vmwareStorageMapping_ceph: MappingData = {
  name: `storage-ceph-${vmwareProvider.name}-mapping`,
  sProviderName: vmwareProvider.name,
  tProviderName: 'host',
  mappingPeer: vmwareStorageMappingPeer_ceph,
};

export const preHookData: HookData = {
  ansiblePlaybook: preAnsiblePlaybook,
};

export const postHookData: HookData = {
  ansiblePlaybook: postAnsiblePlaybook,
};

//Defining vmware cold migration plan for NFS file system
export const vmwareTier0Plan_nfs_cold: PlanData = {
  name: `vmware-tier0-nfs-${vmwareProvider.name}-cold`,
  sProvider: vmwareProvider.name,
  tProvider: 'host',
  namespace: namespace,
  sourceClusterName: vmwareClusterName,
  vmList: vmListArray,
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: vmwareProvider,
  networkMappingData: vmwareNetworkMapping_2x_network,
  storageMappingData: vmwareStorageMapping_nfs,
  warmMigration: false,
  preHook: preHookData,
  postHook: postHookData,
};

//Defining vmware cold migration plan for ceph-rbd file system
export const vmwareTier0Plan_ceph_cold: PlanData = {
  name: `vmware-tier0-ceph-${vmwareProvider.name}-cold`,
  sProvider: vmwareProvider.name,
  tProvider: 'host',
  namespace: namespace,
  sourceClusterName: vmwareClusterName,
  vmList: vmListArray,
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: vmwareProvider,
  networkMappingData: vmwareNetworkMapping_2x_network,
  storageMappingData: vmwareStorageMapping_ceph,
  warmMigration: false,
  preHook: preHookData,
  postHook: postHookData,
};

//Defining vmware warm migration plan for NFS file system
export const vmwareTier0Plan_nfs_warm: PlanData = {
  name: `vmware-tier0-nfs-${vmwareProvider.name}-warm`,
  sProvider: vmwareProvider.name,
  tProvider: 'host',
  namespace: namespace,
  sourceClusterName: vmwareClusterName,
  vmList: vmListArray,
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: vmwareProvider,
  networkMappingData: vmwareNetworkMapping_2x_network,
  storageMappingData: vmwareStorageMapping_nfs,
  warmMigration: true,
  preHook: preHookData,
  postHook: postHookData,
};

//Defining vmware warm migration plan for ceph-rbd file system
export const vmwareTier0Plan_ceph_warm: PlanData = {
  name: `vmware-tier0-ceph-${vmwareProvider.name}-warm`,
  sProvider: vmwareProvider.name,
  tProvider: 'host',
  namespace: namespace,
  sourceClusterName: vmwareClusterName,
  vmList: vmListArray,
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: vmwareProvider,
  networkMappingData: vmwareNetworkMapping_2x_network,
  storageMappingData: vmwareStorageMapping_ceph,
  warmMigration: true,
  preHook: preHookData,
  postHook: postHookData,
};

//Defining test for vmware cold migration with nfs file system
export const vmwareTier0TestNfsCold: TestData = {
  loginData: loginData,
  planData: vmwareTier0Plan_nfs_cold,
};

//Defining test for vmware cold migration with ceph-rbd file system
export const vmwareTier0TestCephCold: TestData = {
  loginData: loginData,
  planData: vmwareTier0Plan_ceph_cold,
};

//Defining test for vmware cold migration with nfs file system
export const vmwareTier0TestNfsWarm: TestData = {
  loginData: loginData,
  planData: vmwareTier0Plan_nfs_warm,
};

//Defining test for vmware cold migration with ceph-rbd file system
export const vmwareTier0TestCephWarm: TestData = {
  loginData: loginData,
  planData: vmwareTier0Plan_ceph_warm,
};

export const vmwareTier0TestArray = [
  vmwareTier0TestCephCold,
  vmwareTier0TestNfsCold,
  vmwareTier0TestCephWarm,
  vmwareTier0TestNfsWarm,
];

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
    dProvider: 'default / mybridge',
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
  name: 'network-qe-rhv-mapping',
  sProviderName: rhvProvider.name,
  tProviderName: 'host',
  mappingPeer: rhvNetworkMappingPeer_2x_network,
};

//Defining RHV storage mapping for NFS file system
export const rhvStorageMapping_nfs: MappingData = {
  name: 'storage-qe-rhv-mapping',
  sProviderName: rhvProvider.name,
  tProviderName: 'host',
  mappingPeer: rhvStorageMappingPeer_nfs,
};

//Defining RHV storage mapping for ceph-rbd file system
export const rhvStorageMapping_ceph: MappingData = {
  name: 'storage-qe-rhv-mapping',
  sProviderName: rhvProvider.name,
  tProviderName: 'host',
  mappingPeer: rhvStorageMappingPeer_ceph,
};

//Defining RHV cold migration plan for NFS file system
export const rhvTier0Plan_nfs_cold: PlanData = {
  name: `rhv-tier0-nfs-${rhvProvider.name}`,
  sProvider: rhvProvider.name,
  tProvider: 'host',
  namespace: 'tier0',
  sourceClusterName: v2v_rhv_clustername,
  vmList: vmListArray,
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: rhvProvider,
  networkMappingData: rhvNetworkMapping_2x_network,
  storageMappingData: rhvStorageMapping_nfs,
  warmMigration: false,
};

//Defining RHV cold migration plan for ceph-rbd file system
export const rhvTier0Plan_ceph_cold: PlanData = {
  name: `rhv-tier0-ceph-${rhvProvider.name}`,
  sProvider: rhvProvider.name,
  tProvider: 'host',
  namespace: 'tier0',
  sourceClusterName: v2v_rhv_clustername,
  vmList: vmListArray,
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: rhvProvider,
  networkMappingData: rhvNetworkMapping_2x_network,
  storageMappingData: rhvStorageMapping_ceph,
  warmMigration: false,
};

//Defining RHV warm migration plan for NFS file system
export const rhvTier0Plan_nfs_warm: PlanData = {
  name: `rhv-tier0-nfs-${rhvProvider.name}`,
  sProvider: rhvProvider.name,
  tProvider: 'host',
  namespace: 'tier0',
  sourceClusterName: v2v_rhv_clustername,
  vmList: vmListArray,
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
  namespace: 'tier0',
  sourceClusterName: v2v_rhv_clustername,
  vmList: vmListArray,
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: rhvProvider,
  networkMappingData: rhvNetworkMapping_2x_network,
  storageMappingData: rhvStorageMapping_ceph,
  warmMigration: true,
};

//Defining test for RHV cold igration with nfs file system
export const rhvTier0TestNfsCold: TestData = {
  loginData: loginData,
  planData: rhvTier0Plan_nfs_cold,
};

//Defining test for RHV cold migration with ceph-rbd file system
export const rhvTiesr0TestCephCold: TestData = {
  loginData: loginData,
  planData: rhvTier0Plan_ceph_cold,
};

//Defining test for RHV wamm igration with nfs file system
export const rhvTier0TestNfsWarm: TestData = {
  loginData: loginData,
  planData: rhvTier0Plan_nfs_warm,
};

//Defining test for RHV warm migration with ceph-rbd file system
export const rhvTiesr0TestCephWarm: TestData = {
  loginData: loginData,
  planData: rhvTier0Plan_ceph_warm,
};

export const rhvTier0TestArray = [
  rhvTier0TestNfsCold,
  rhvTiesr0TestCephCold,
  rhvTier0TestNfsWarm,
  rhvTiesr0TestCephWarm,
];
