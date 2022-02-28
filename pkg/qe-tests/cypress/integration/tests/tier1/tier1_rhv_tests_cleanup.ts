import { providerRhv } from '../../models/providerRhv';
import {
  rhvTier1TestNfsWarm,
  rhvTier1TestNfsCold,
  rhvTier1TestCephCold,
  rhvTier1TestCephWarm,
} from './config_tier1';
import { login } from '../../../utils/utils';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';
import { Plan } from '../../models/plan';
import { duplicateTestData, testData } from '../vmware/config_separate_mapping';

describe('Tier1 Cleanup tests, deleting plans, network and storage mappings and Provider', () => {
  const provider = new providerRhv();
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();
  const plan = new Plan();
  beforeEach(() => {
    login(testData.loginData);
  });
  it('Deleting Archived plan', () => {
    plan.deleteArchive(rhvTier1TestNfsWarm.planData);
    plan.delete(rhvTier1TestNfsCold.planData);
  });
  it('Deleting plans', () => {
    plan.delete(rhvTier1TestCephWarm.planData);
    plan.delete(rhvTier1TestCephCold.planData);
  });
  it('Deleting Duplicate plans', () => {
    plan.delete(testData.planData);
    plan.delete(duplicateTestData.planData);
  });
  it('Deleting network mapping', () => {
    networkMapping.delete(rhvTier1TestNfsWarm.planData.networkMappingData);
  });
  it('Deleting storage mappings', () => {
    storageMapping.delete(testData.planData.storageMappingData);
    storageMapping.delete(rhvTier1TestNfsCold.planData.storageMappingData);
    storageMapping.delete(rhvTier1TestCephCold.planData.storageMappingData);
  });
  it('Deleting Provider', () => {
    provider.delete(rhvTier1TestNfsWarm.planData.providerData);
  });
  it('Deleting VMs on Openshit side', () => {
    const namespace = rhvTier1TestNfsWarm.planData.namespace;
    const vm_list = rhvTier1TestNfsWarm.planData.vmList;
    vm_list.forEach((vm) => {
      cy.exec(`oc delete vm ${vm} -n${namespace}`);
    });
  });
});
