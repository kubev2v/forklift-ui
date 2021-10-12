import { providerRhv } from '../../models/providerRhv';
import { testData } from './config_separate_mapping_rhv';
import { login } from '../../../utils/utils';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';
import { Plan } from '../../models/plan';

describe('Deleting plan, mappings and provider', () => {
  const provider = new providerRhv();
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();
  const plan = new Plan();

  it('Deleting provider, mappings and plan created in a previous tests', () => {
    login(testData.loginData);
    plan.delete(testData.planData);
    networkMapping.delete(testData.planData.networkMappingData);
    storageMapping.delete(testData.planData.storageMappingData);
    provider.delete(testData.planData.providerData);
  });
});