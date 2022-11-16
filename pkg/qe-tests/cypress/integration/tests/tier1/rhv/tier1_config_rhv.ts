import {
  CutoverData,
  HookData,
  LoginData,
  MappingData,
  MappingPeer,
  PlanData,
  RhvProviderData,
  TestData,
  // HookData,
} from '../../../types/types';
import { providerType, storageType } from '../../../types/constants';

//Defining URL and credentials for target cluster
const url = Cypress.env('url');
const user_login = 'kubeadmin';
const user_password = Cypress.env('pass');

/**
 * Starting RHV section
 **/
//Getting required env variables for RHV
const v2v_rhv_providername = Cypress.env('v2v_rhv_providername');
const v2v_rhv_admin_username = Cypress.env('v2v_rhv_admin_username');
const v2v_rhv_admin_password = Cypress.env('v2v_rhv_admin_password');
const v2v_rhv_username = Cypress.env('v2v_rhv_username');
const v2v_rhv_password = Cypress.env('v2v_rhv_password');
const v2v_rhv_hostname = Cypress.env('v2v_rhv_hostname');
const v2v_rhv_clustername = Cypress.env('v2v_rhv_clustername');
const sourceProviderStorage = Cypress.env('v2v_rhvStorageSource');
const v2v_rhv_cert = Cypress.env('v2v_rhv_cert');
const vmListArray = Cypress.env('vm_list');
const warmVmListArray = Cypress.env('warm_vm_list');
const preAnsiblePlaybook = Cypress.env('preAnsiblePlaybook');
const postAnsiblePlaybook = Cypress.env('postAnsiblePlaybook');
const targetNamespace = 'tier1';

// Defining data required for login
export const loginData: LoginData = {
  username: user_login,
  password: user_password,
  url: url,
};

export const cutoverTime: CutoverData = {
  date: '',
  time: '',
};

//Defining RHV provider
export const rhvProviderAdmin: RhvProviderData = {
  type: providerType.rhv,
  name: v2v_rhv_providername,
  hostname: v2v_rhv_hostname,
  username: v2v_rhv_admin_username,
  password: v2v_rhv_admin_password,
  cert: v2v_rhv_cert,
};

export const rhvProviderUser: RhvProviderData = {
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
export const rhvStorageMappingPeer_nfs: MappingPeer[] = [];

//Defining RHV storage mapping peer for ceph-rbd
export const rhvStorageMappingPeer_ceph: MappingPeer[] = [];
sourceProviderStorage.forEach((currentStorage) => {
  rhvStorageMappingPeer_nfs.push({
    sProvider: currentStorage,
    dProvider: storageType.nfs,
  });
  rhvStorageMappingPeer_ceph.push({
    sProvider: currentStorage,
    dProvider: storageType.cephRbd,
  });
});

//Defining RHV network mapping using 2 peers
export const rhvNetworkMapping_2x_network: MappingData = {
  name: `network-${rhvProviderUser.name}-mapping`,
  sProviderName: rhvProviderUser.name,
  tProviderName: 'host',
  mappingPeer: rhvNetworkMappingPeer_2x_network,
};

//Defining RHV storage mapping for ceph-rbd file system
export const rhvStorageMapping_ceph: MappingData = {
  name: `storage-ceph-${rhvProviderUser.name}-mapping`,
  sProviderName: rhvProviderUser.name,
  tProviderName: 'host',
  mappingPeer: rhvStorageMappingPeer_ceph,
};

//Defining RHV storage mapping for NFS file system
// export const rhvStorageMapping_nfs: MappingData = {
//   name: `storage-nfs-${rhvProvider.name}-mapping`,
//   sProviderName: rhvProvider.name,
//   tProviderName: 'host',
//   mappingPeer: rhvStorageMappingPeer_nfs,
// };

export const preHookData: HookData = {
  ansiblePlaybook: preAnsiblePlaybook,
};

export const postHookData: HookData = {
  ansiblePlaybook: postAnsiblePlaybook,
};

//Defining RHV cold migration plan for ceph-rbd file system
export const rhvtier1Plan_ceph_cold: PlanData = {
  name: `rhv-tier1-ceph-${rhvProviderAdmin.name}`,
  sProvider: rhvProviderAdmin.name,
  tProvider: 'host',
  namespace: targetNamespace,
  sourceClusterName: v2v_rhv_clustername,
  vmList: vmListArray,
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: rhvProviderUser,
  networkMappingData: rhvNetworkMapping_2x_network,
  storageMappingData: rhvStorageMapping_ceph,
  warmMigration: false,
  preHook: preHookData,
  postHook: postHookData,
};

export const rhvTier1Plan_ceph_cold_duplicate: PlanData = {
  name: `rhv-tier1-ceph-${rhvProviderUser.name}-duplicate`,
  sProvider: rhvProviderUser.name,
  tProvider: 'host',
  namespace: targetNamespace,
  sourceClusterName: v2v_rhv_clustername,
  vmList: vmListArray,
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: rhvProviderUser,
  networkMappingData: rhvNetworkMapping_2x_network,
  storageMappingData: rhvStorageMapping_ceph,
  warmMigration: false,
  preHook: preHookData,
  postHook: postHookData,
};

//Defining RHV cold migration plan for NFS file system
// export const rhvtier1Plan_nfs_cold: PlanData = {
//   name: `rhv-tier1-nfs-${rhvProvider.name}`,
//   sProvider: rhvProvider.name,
//   tProvider: 'host',
//   namespace: targetNamespace,
//   sourceClusterName: v2v_rhv_clustername,
//   vmList: vmListArray,
//   useExistingNetworkMapping: true,
//   useExistingStorageMapping: true,
//   providerData: rhvProvider,
//   networkMappingData: rhvNetworkMapping_2x_network,
//   storageMappingData: rhvStorageMapping_nfs,
//   warmMigration: false,
//   preHook: preHookData,
//   postHook: postHookData,
// };

//Defining RHV warm migration plan for NFS file system
// export const rhvtier1Plan_nfs_warm: PlanData = {
//   name: `rhv-tier1-nfs-${rhvProvider.name}`,
//   sProvider: rhvProvider.name,
//   tProvider: 'host',
//   namespace: targetNamespace,
//   sourceClusterName: v2v_rhv_clustername,
//   vmList: warmVmListArray,
//   useExistingNetworkMapping: true,
//   useExistingStorageMapping: true,
//   providerData: rhvProvider,
//   networkMappingData: rhvNetworkMapping_2x_network,
//   storageMappingData: rhvStorageMapping_nfs,
//   warmMigration: true,
//   scheduledCutover: cutoverTime,
//   preHook: preHookData,
//   postHook: postHookData,
// };

//Defining RHV warm migration plan for ceph-rbd file system
export const rhvtier1Plan_ceph_warm: PlanData = {
  name: `rhv-tier1-ceph-${rhvProviderUser.name}`,
  sProvider: rhvProviderUser.name,
  tProvider: 'host',
  namespace: targetNamespace,
  sourceClusterName: v2v_rhv_clustername,
  vmList: warmVmListArray,
  useExistingNetworkMapping: true,
  useExistingStorageMapping: true,
  providerData: rhvProviderUser,
  networkMappingData: rhvNetworkMapping_2x_network,
  storageMappingData: rhvStorageMapping_ceph,
  warmMigration: true,
  scheduledCutover: cutoverTime,
  preHook: preHookData,
  postHook: postHookData,
};

//Defining test for RHV cold migration with ceph-rbd file system
export const rhvTier1TestCephCold: TestData = {
  loginData: loginData,
  planData: rhvtier1Plan_ceph_cold,
};

export const rhvTier1TestCephCold_duplicate: TestData = {
  loginData: loginData,
  planData: rhvTier1Plan_ceph_cold_duplicate,
};

//Defining test for RHV cold migration with nfs file system
// export const rhvtier1TestNfsCold: TestData = {
//   loginData: loginData,
//   planData: rhvtier1Plan_nfs_cold,
// };

//Defining test for RHV warm migration with ceph-rbd file system
export const rhvTiesr1TestCephWarm: TestData = {
  loginData: loginData,
  planData: rhvtier1Plan_ceph_warm,
};

//Defining test for RHV warm migration with nfs file system
// export const rhvtier1TestNfsWarm: TestData = {
//   loginData: loginData,
//   planData: rhvtier1Plan_nfs_warm,
// };

// export const rhvtier1TestArray = [
//   rhvTier1TestCephCold,
//   rhvtier1TestNfsCold,
//   rhvTiesr1TestCephWarm,
//   rhvtier1TestNfsWarm,
// ];
