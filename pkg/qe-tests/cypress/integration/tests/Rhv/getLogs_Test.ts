import { login } from '../../../utils/utils';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';
import { Plan } from '../../models/plan';
import { providerRhv } from '../../models/providerRhv';
import { testData } from './config_separate_mapping_rhv';

describe('Automate get logs Test for Succeeded Plan', () => {
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
    plan.execute(testData.planData);
  });

  it('get logs for succeeded plan', () => {
    plan.getLogs(testData.planData);
  });

  after(() => {
    plan.delete(testData.planData);
    networkMapping.delete(testData.planData.networkMappingData);
    storageMapping.delete(testData.planData.storageMappingData);
    source.delete(testData.planData.providerData);
  });
});
