import { ProviderVmware } from '../../models/providerVmware';
import {
  vmwareTier1Plan_ceph_cold,
  vmwareTier1Plan_nfs_cold,
  vmwareTier1TestCephCold,
  vmwareTier1TestCephWarm,
  vmwareTier1TestNfsCold,
  vmwareTier1TestNfsWarm,
} from './config_tier1';
import { login } from '../../../utils/utils';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';
import { Plan } from '../../models/plan';
import { duplicateTestData, testData } from '../vmware/config_separate_mapping';

describe(
  'Tier1 tests, creating VMWare provider, network and storage(nfs) mappings, failed plan (warm),' +
    'Get logs Test case,' +
    'Edit plan,' +
    'Duplicate plan,' +
    ' Archive+Duplicate Plan ',
  () => {
    const provider = new ProviderVmware();
    const networkMapping = new MappingNetwork();
    const storageMapping = new MappingStorage();
    const plan = new Plan();

    beforeEach(() => {
      login(testData.loginData);
    });

    it('Login to MTV and create provider', () => {
      provider.create(vmwareTier1Plan_nfs_cold.providerData);
    });

    it('Create new network and storage mappings', () => {
      networkMapping.create(vmwareTier1Plan_nfs_cold.networkMappingData);
      storageMapping.create(vmwareTier1Plan_nfs_cold.storageMappingData);
      storageMapping.create(vmwareTier1Plan_ceph_cold.storageMappingData);
    });

    it('Creating plan with existing network and storage mapping', () => {
      plan.create(vmwareTier1TestNfsCold.planData);
      plan.create(vmwareTier1TestCephCold.planData);
      plan.create(vmwareTier1TestCephWarm.planData);
    });

    it('Create a provider, mappings, plan and failed plan', () => {
      plan.create(vmwareTier1TestNfsWarm.planData);
      plan.failed(vmwareTier1TestNfsWarm.planData);
    });

    it('get logs for failed plan', () => {
      plan.getLogs(vmwareTier1TestNfsWarm.planData);
    });

    it('get logs for Cancelled plan', () => {
      plan.cancel_plan(vmwareTier1TestCephCold.planData);
      plan.getLogs(vmwareTier1TestCephCold.planData);
    });

    it('Archiving plan', () => {
      plan.archive(vmwareTier1TestNfsWarm.planData);
    });

    it('Editing an existing plan', () => {
      plan.edit(vmwareTier1TestCephWarm.planData, duplicateTestData.planData);
    });

    it('create provider, mappings and plans', () => {
      storageMapping.create(testData.planData.storageMappingData);
      plan.create(testData.planData);
    });

    it('Duplicate a cancelled Plan', () => {
      plan.cancel_plan(testData.planData);
      plan.duplicate(testData.planData, duplicateTestData.planData);
    });

    it('get logs for successful plan', () => {
      plan.execute(vmwareTier1TestNfsCold.planData);
      plan.getLogs(vmwareTier1TestNfsCold.planData);
    });
  }
);
