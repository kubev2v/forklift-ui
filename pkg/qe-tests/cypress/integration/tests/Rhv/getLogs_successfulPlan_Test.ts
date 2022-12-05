import { login } from '../../../utils/utils';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';
import { Plan } from '../../models/plan';
import { ProviderRhv } from '../../models/providerRhv';
import { testrhel8Cold } from './config_separate_mapping_rhv';

describe('Automate get logs Test for Succeeded Plan', () => {
  const source = new ProviderRhv();
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();
  const plan = new Plan();

  before(() => {
    login(testrhel8Cold.loginData);
    source.create(testrhel8Cold.planData.providerData);
    networkMapping.create(testrhel8Cold.planData.networkMappingData);
    storageMapping.create(testrhel8Cold.planData.storageMappingData);
    plan.create(testrhel8Cold.planData);
    plan.execute(testrhel8Cold.planData);
  });

  it('get logs for succeeded plan', () => {
    plan.getLogs(testrhel8Cold.planData);
  });

  after(() => {
    plan.delete(testrhel8Cold.planData);
    networkMapping.delete(testrhel8Cold.planData.networkMappingData);
    storageMapping.delete(testrhel8Cold.planData.storageMappingData);
    source.delete(testrhel8Cold.planData.providerData);
  });
});
