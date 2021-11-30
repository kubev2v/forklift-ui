import { login } from '../../../utils/utils';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';
import { Plan } from '../../models/plan';
import { providerRhv } from '../../models/providerRhv';
import { testData, duplicateTestData } from './config_separate_mapping_rhv';
describe('Duplicate a cold migration test', () => {
  const source = new providerRhv();
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();
  const plan = new Plan();

  before(() => {
    login(testData.loginData);
    source.create(testData.planData.providerData);
    networkMapping.create(testData.planData.networkMappingData);
    storageMapping.create(testData.planData.storageMappingData);
    plan.create(testData.planData);
    plan.cancel_plan(testData.planData);
  });
  it('Edit a duplicate Plan', () => {
    plan.duplicate(testData.planData, duplicateTestData.planData);
  });
  it.skip('duplicate a Plan', () => {
    plan.duplicate(testData.planData, testData.planData);
  });
  after(() => {
    plan.delete(duplicateTestData.planData);
    plan.delete(testData.planData);
    networkMapping.delete(testData.planData.networkMappingData);
    storageMapping.delete(testData.planData.storageMappingData);
    source.delete(testData.planData.providerData);
  });
});
