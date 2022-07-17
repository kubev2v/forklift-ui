import { ProviderVmware } from '../../../models/providerVmware';
import { createNamespace, getStarted, login, provisionNetwork } from '../../../../utils/utils';
import {
  vmwareStorageMapping_ceph,
  vmwareStorageMapping_nfs,
  vmwareTier1TestCephCold,
} from './tier1_config_vmware';
import {
  vmwareNetworkMapping_2x_network,
  vmwareNetworkMappingSingle,
  vmwareProviderUser,
} from './tier1_config_vmware';
import { SEC } from '../../../types/constants';
import { MappingNetwork } from '../../../models/mappingNetwork';
import { MappingStorage } from '../../../models/mappingStorage';

describe('Tier1 tests for testing provider', () => {
  const provider = new ProviderVmware();
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();
  before('Login to MTV', () => {
    // Clearing all cookies in local storage if any
    cy.clearLocalStorageSnapshot();
    login(vmwareTier1TestCephCold.loginData);
    getStarted();
    provider.create(vmwareProviderUser);
    // Saving local storage state after login
    cy.saveLocalStorage();
    createNamespace(vmwareTier1TestCephCold.planData.namespace);
    provisionNetwork(vmwareTier1TestCephCold.planData.namespace);
  });

  beforeEach('Login to MTV', () => {
    // Restoring local storage and opening base MTV URL
    cy.restoreLocalStorage();
    cy.visit(vmwareTier1TestCephCold.loginData.url, { timeout: 120 * SEC });
    getStarted();
  });

  it('Creating and editing network mapping', () => {
    networkMapping.create(vmwareNetworkMappingSingle);
    networkMapping.edit(vmwareNetworkMapping_2x_network);
  });

  it('Duplicate network mapping creation, negative test', () => {
    networkMapping.createDuplicate(vmwareNetworkMapping_2x_network);
  });

  it('Creating and editing storage mapping', () => {
    storageMapping.create(vmwareStorageMapping_nfs);
    storageMapping.edit(vmwareStorageMapping_ceph);
  });

  it('Duplicate storage mapping creation, negative test', () => {
    storageMapping.createDuplicate(vmwareStorageMapping_ceph);
  });

  after('Cleaning up', () => {
    provider.delete(vmwareProviderUser);
    networkMapping.delete(vmwareNetworkMapping_2x_network);
    storageMapping.delete(vmwareStorageMapping_ceph);
  });
});
