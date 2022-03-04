import { login } from '../../../utils/utils';
import { providerRhv } from '../../models/providerRhv';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';
import { Plan } from '../../models/plan';
import { duplicateTestData, testData } from '../Rhv/config_separate_mapping_rhv';
import {
  rhvTier1Plan_ceph_cold,
  rhvTier1Plan_nfs_cold,
  rhvTier1TestCephCold,
  rhvTier1TestCephWarm,
  rhvTier1TestNfsCold,
  rhvTier1TestNfsWarm,
} from './config_tier1';

describe(
  'Tier1 tests, creating VMWare provider, network and storage(nfs) mappings, failed plan (warm),' +
    'Get logs Test case,' +
    'Edit plan,' +
    'Duplicate plan,' +
    ' Archive+Duplicate Plan ',
  () => {
    const provider = new providerRhv();
    const networkMapping = new MappingNetwork();
    const storageMapping = new MappingStorage();
    const plan = new Plan();

    beforeEach(() => {
      login(testData.loginData);
    });

    it('Login to MTV and create provider', () => {
      provider.create(rhvTier1Plan_nfs_cold.providerData);
    });

    it('Create new network and storage mappings', () => {
      networkMapping.create(rhvTier1Plan_nfs_cold.networkMappingData);
      storageMapping.create(rhvTier1Plan_nfs_cold.storageMappingData);
      storageMapping.create(rhvTier1Plan_ceph_cold.storageMappingData);
    });

    it('Creating plan with existing network and storage mapping', () => {
      plan.create(rhvTier1TestNfsCold.planData);
      plan.create(rhvTier1TestCephCold.planData);
      plan.create(rhvTier1TestCephWarm.planData);
    });

    it('Create a nfs warm plan and plan failed', () => {
      plan.create(rhvTier1TestNfsWarm.planData);
      plan.failed(rhvTier1TestNfsWarm.planData);
    });

    it('get logs for failed plan', () => {
      plan.getLogs(rhvTier1TestNfsWarm.planData);
    });

    it('get logs for Cancelled plan', () => {
      plan.cancel_plan(rhvTier1TestCephCold.planData);
      plan.getLogs(rhvTier1TestCephCold.planData);
    });

    it('Archiving plan', () => {
      plan.archive(rhvTier1TestNfsWarm.planData);
    });

    it('Editing an existing plan', () => {
      networkMapping.create(duplicateTestData.planData.networkMappingData);
      plan.edit(rhvTier1TestCephWarm.planData, duplicateTestData.planData);
    });

    it('create provider, mappings and plans', () => {
      plan.create(testData.planData);
    });

    it('Duplicate a cancelled Plan', () => {
      plan.cancel_plan(testData.planData);
      plan.duplicate(testData.planData, duplicateTestData.planData);
    });

    it('get logs for successful plan', () => {
      plan.execute(rhvTier1TestNfsCold.planData);
      plan.getLogs(rhvTier1TestNfsCold.planData);
    });

    after(() => {
      plan.deleteArchive(rhvTier1TestNfsWarm.planData);
      plan.delete(rhvTier1TestNfsWarm.planData);
      plan.delete(rhvTier1TestNfsCold.planData);
      plan.delete(rhvTier1TestCephWarm.planData);
      plan.delete(rhvTier1TestCephCold.planData);
      plan.delete(testData.planData);
      plan.delete(duplicateTestData.planData);
      networkMapping.delete(rhvTier1TestNfsWarm.planData.networkMappingData);
      storageMapping.delete(testData.planData.storageMappingData);
      storageMapping.delete(rhvTier1TestNfsCold.planData.storageMappingData);
      storageMapping.delete(rhvTier1TestCephCold.planData.storageMappingData);
      provider.delete(rhvTier1TestNfsWarm.planData.providerData);
      const namespace = rhvTier1TestNfsWarm.planData.namespace;
      const vm_list = rhvTier1TestNfsWarm.planData.vmList;
      vm_list.forEach((vm) => {
        cy.exec(`oc delete vm ${vm} -n${namespace}`);
      });
    });
  }
);
