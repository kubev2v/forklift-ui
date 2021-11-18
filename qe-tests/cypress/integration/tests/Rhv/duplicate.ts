import { login } from '../../../utils/utils';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';
import { Plan } from '../../models/plan';
import { Plan_duplicate } from '../../models/duplicate';
import { providerRhv } from '../../models/providerRhv';
import { testData } from './config_separate_mapping_rhv';

describe('Duplicate a cold migration test', () => {
  const source = new providerRhv();
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();
  const plan = new Plan();
  const plan_copy = new Plan_duplicate();

  before(() => {
    login(testData.loginData);
    source.create(testData.planData.providerData);
    networkMapping.create(testData.planData.networkMappingData);
    storageMapping.create(testData.planData.storageMappingData);
    plan.create(testData.planData);
    plan.cancel_plan(testData.planData);
  });

  it('duplicate', () => {
    plan_copy.duplicate(testData.planData);
  });
});
