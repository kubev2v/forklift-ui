import { ProviderVmware } from '../../models/providerVmware';
import {
  vmwareTier1TestNfsWarm,
  vmwareTier1TestNfsCold,
  vmwareTier1TestCephCold,
  vmwareTier1TestCephWarm,
} from './config_tier1';
import { login } from '../../../utils/utils';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';
import { Plan } from '../../models/plan';
import { duplicateTestData, testData } from '../vmware/config_separate_mapping';

describe('Tier1 Cleanup tests, deleting plans, network and storage mappings and Provider', () => {
  const provider = new ProviderVmware();
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();
  const plan = new Plan();
  beforeEach(() => {
    login(testData.loginData);
  });
  it('Deleting Archived plan', () => {
    plan.deleteArchive(vmwareTier1TestNfsWarm.planData);
    plan.delete(vmwareTier1TestNfsCold.planData);
  });
  it('Deleting plans', () => {
    plan.delete(vmwareTier1TestCephWarm.planData);
    plan.delete(vmwareTier1TestCephCold.planData);
  });
  it('Deleting Duplicate plans', () => {
    plan.delete(testData.planData);
    plan.delete(duplicateTestData.planData);
  });
  it('Deleting network mapping', () => {
    networkMapping.delete(vmwareTier1TestNfsWarm.planData.networkMappingData);
  });
  it('Deleting storage mappings', () => {
    storageMapping.delete(testData.planData.storageMappingData);
    storageMapping.delete(vmwareTier1TestNfsCold.planData.storageMappingData);
    storageMapping.delete(vmwareTier1TestCephCold.planData.storageMappingData);
  });
  it('Deleting Provider', () => {
    provider.delete(vmwareTier1TestNfsWarm.planData.providerData);
  });
});
