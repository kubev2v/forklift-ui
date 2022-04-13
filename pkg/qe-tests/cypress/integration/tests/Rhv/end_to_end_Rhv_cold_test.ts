import { testrhel8Cold } from './config_separate_mapping_rhv';
import { cleanVms, login } from '../../../utils/utils';
import { providerRhv } from '../../models/providerRhv';
import { RhvProviderData } from '../../types/types';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';
import { Plan } from '../../models/plan';

describe('Creating provider and deleting', () => {
  const provider = new providerRhv();
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();
  const plan = new Plan();
  const providerData: RhvProviderData = testrhel8Cold.planData.providerData;

  beforeEach(() => {
    login(testrhel8Cold.loginData);
  });

  it('Login to MTV and create provider', () => {
    provider.create(providerData);
  });

  it('Create new network and storage mapping', () => {
    networkMapping.create(testrhel8Cold.planData.networkMappingData);
    storageMapping.create(testrhel8Cold.planData.storageMappingData);
  });

  it('Creating plan with existing network and storage mapping', () => {
    plan.create(testrhel8Cold.planData);
  });

  it('Running plan created in a previous tests', () => {
    plan.execute(testrhel8Cold.planData);
  });

  after('Deleting plan, mappings and provider created in a previous tests', () => {
    // login(currentTest.loginData);
    plan.delete(testrhel8Cold.planData);
    networkMapping.delete(testrhel8Cold.planData.networkMappingData);
    storageMapping.delete(testrhel8Cold.planData.storageMappingData);
    provider.delete(testrhel8Cold.planData.providerData);
    cleanVms(testrhel8Cold.planData.vmList, testrhel8Cold.planData.namespace);
  });
});
