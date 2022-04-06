import { login } from '../../../utils/utils';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';
import { Plan } from '../../models/plan';
import { providerRhv } from '../../models/providerRhv';
import { testrhel8Cold, duplicateTestData } from './config_separate_mapping_rhv';
describe('Duplicate a cold migration test', () => {
  const source = new providerRhv();
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();
  const plan = new Plan();

  before(() => {
    login(testrhel8Cold.loginData);
    source.create(testrhel8Cold.planData.providerData);
    networkMapping.create(testrhel8Cold.planData.networkMappingData);
    storageMapping.create(testrhel8Cold.planData.storageMappingData);
    plan.create(testrhel8Cold.planData);
    plan.cancel_plan(testrhel8Cold.planData);
  });
  it('Edit a duplicate Plan', () => {
    plan.duplicate(testrhel8Cold.planData, duplicateTestData.planData);
  });
  it.skip('duplicate a Plan', () => {
    plan.duplicate(testrhel8Cold.planData, testrhel8Cold.planData);
  });
  after(() => {
    plan.delete(duplicateTestData.planData);
    plan.delete(testrhel8Cold.planData);
    networkMapping.delete(testrhel8Cold.planData.networkMappingData);
    storageMapping.delete(testrhel8Cold.planData.storageMappingData);
    source.delete(testrhel8Cold.planData.providerData);
  });
});
