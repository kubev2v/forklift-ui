import {
  LoginData,
  MappingData,
  MappingPeer,
  PlanData,
  RhvProviderData,
  TestData,
  VmwareProviderData,
} from '../../types/types';
import { providerType, storageType } from '../../types/constants';
import { postHookData, preHookData } from '../vmware/config_separate_mapping';

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
// const sourceProviderStorage = Cypress.env('v2v_vmwareStorageSource');
const vmListArray = Cypress.env('vm_list');
const v2v_vmware_vddkImage = Cypress.env('v2v_vmware_vddkImage');

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
    dProvider: 'tier1 / ovn-kubernetes1',
  },
];

//Defining vmware storage mapping peer for NFS
export const vmwareStorageMappingPeer_nfs: MappingPeer[] = [
  {
    sProvider: 'v2v_general_porpuse_ISCSI_DC',
    dProvider: storageType.nfs,
  },
];

//Defining vmware storage mapping peer for CEPH
export const vmwareStorageMappingPeer_ceph: MappingPeer[] = [
  {
    sProvider: 'v2v_general_porpuse_ISCSI_DC',
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

//Defining vmware cold migration plan for NFS file system
export const vmwareTier1Plan_nfs_cold: PlanData = {
  name: `vmware-tier1-nfs-${vmwareProvider.name}-cold`,
  sProvider: vmwareProvider.name,
  tProvider: 'host',
  namespace: 'tier1',
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
export const vmwareTier1Plan_ceph_cold: PlanData = {
  name: `vmware-tier1-ceph-${vmwareProvider.name}-cold`,
  sProvider: vmwareProvider.name,
  tProvider: 'host',
  namespace: 'tier1',
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
export const vmwareTier1Plan_nfs_warm: PlanData = {
  name: `vmware-tier1-nfs-${vmwareProvider.name}-warm`,
  sProvider: vmwareProvider.name,
  tProvider: 'host',
  namespace: 'tier1',
  sourceClusterName: vmwareClusterName,
  vmList: ['v2v-rhel7-2nic2diskigor-clone'],
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
export const vmwareTier1Plan_ceph_warm: PlanData = {
  name: `vmware-tier1-ceph-${vmwareProvider.name}-warm`,
  sProvider: vmwareProvider.name,
  tProvider: 'host',
  namespace: 'tier1',
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
export const vmwareTier1TestNfsCold: TestData = {
  loginData: loginData,
  planData: vmwareTier1Plan_nfs_cold,
};

//Defining test for vmware cold migration with ceph-rbd file system
export const vmwareTier1TestCephCold: TestData = {
  loginData: loginData,
  planData: vmwareTier1Plan_ceph_cold,
};

//Defining test for vmware cold migration with nfs file system
export const vmwareTier1TestNfsWarm: TestData = {
  loginData: loginData,
  planData: vmwareTier1Plan_nfs_warm,
};

//Defining test for vmware cold migration with ceph-rbd file system
export const vmwareTier1TestCephWarm: TestData = {
  loginData: loginData,
  planData: vmwareTier1Plan_ceph_warm,
};

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
    dProvider: 'tier1 / ovn-kubernetes1',
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

//Defining RHV storage mapping for NFS file system
export const rhvStorageMapping_nfs: MappingData = {
  name: `storage-${rhvProvider.name}-mapping`,
  sProviderName: rhvProvider.name,
  tProviderName: 'host',
  mappingPeer: rhvStorageMappingPeer_nfs,
};

//Defining RHV storage mapping for ceph-rbd file system
export const rhvStorageMapping_ceph: MappingData = {
  name: `storage-ceph-${rhvProvider.name}-mapping`,
  sProviderName: rhvProvider.name,
  tProviderName: 'host',
  mappingPeer: rhvStorageMappingPeer_ceph,
};

//Defining RHV cold migration plan for NFS file system
export const rhvTier1Plan_nfs_cold: PlanData = {
  name: `rhv-tier1-nfs-${rhvProvider.name}-cold`,
  sProvider: rhvProvider.name,
  tProvider: 'host',
  namespace: 'tier1',
  sourceClusterName: v2v_rhv_clustername,
  vmList: vmListArray,
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: rhvProvider,
  networkMappingData: rhvNetworkMapping_2x_network,
  storageMappingData: rhvStorageMapping_nfs,
  warmMigration: false,
  preHook: preHookData,
  postHook: postHookData,
};

//Defining RHV cold migration plan for ceph-rbd file system
export const rhvTier1Plan_ceph_cold: PlanData = {
  name: `rhv-tier1-ceph-${rhvProvider.name}-cold`,
  sProvider: rhvProvider.name,
  tProvider: 'host',
  namespace: 'tier1',
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

//Defining RHV warm migration plan for NFS file system
export const rhvTier1Plan_nfs_warm: PlanData = {
  name: `rhv-tier1-nfs-${rhvProvider.name}-warm`,
  sProvider: rhvProvider.name,
  tProvider: 'host',
  namespace: 'tier1',
  sourceClusterName: v2v_rhv_clustername,
  vmList: ['v2v-karishma-rhel8-2disks2nics-vm'],
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: rhvProvider,
  networkMappingData: rhvNetworkMapping_2x_network,
  storageMappingData: rhvStorageMapping_nfs,
  warmMigration: true,
  preHook: preHookData,
  postHook: postHookData,
};

//Defining RHV warm migration plan for ceph-rbd file system
export const rhvTier1Plan_ceph_warm: PlanData = {
  name: `rhv-tier1-ceph-${rhvProvider.name}-warm`,
  sProvider: rhvProvider.name,
  tProvider: 'host',
  namespace: 'tier1',
  sourceClusterName: v2v_rhv_clustername,
  vmList: vmListArray,
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: rhvProvider,
  networkMappingData: rhvNetworkMapping_2x_network,
  storageMappingData: rhvStorageMapping_ceph,
  warmMigration: true,
  preHook: preHookData,
  postHook: postHookData,
};

//Defining test for RHV cold migration with nfs file system
export const rhvTier1TestNfsCold: TestData = {
  loginData: loginData,
  planData: rhvTier1Plan_nfs_cold,
};

//Defining test for RHV cold migration with ceph-rbd file system
export const rhvTier1TestCephCold: TestData = {
  loginData: loginData,
  planData: rhvTier1Plan_ceph_cold,
};

//Defining test for RHV warm migration with nfs file system
export const rhvTier1TestNfsWarm: TestData = {
  loginData: loginData,
  planData: rhvTier1Plan_nfs_warm,
};

//Defining test for RHV warm migration with ceph-rbd file system
export const rhvTier1TestCephWarm: TestData = {
  loginData: loginData,
  planData: rhvTier1Plan_ceph_warm,
};

export const rhvTier1TestArray = [
  rhvTier1TestNfsCold,
  rhvTier1TestCephCold,
  rhvTier1TestNfsWarm,
  rhvTier1TestCephWarm,
];
