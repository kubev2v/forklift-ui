import { providerRhv } from '../../models/providerRhv';
import { testrhel8Cold } from './config_separate_mapping_rhv';
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
    login(testrhel8Cold.loginData);
    plan.delete(testrhel8Cold.planData);
    networkMapping.delete(testrhel8Cold.planData.networkMappingData);
    storageMapping.delete(testrhel8Cold.planData.storageMappingData);
    provider.delete(testrhel8Cold.planData.providerData);
  });
});
