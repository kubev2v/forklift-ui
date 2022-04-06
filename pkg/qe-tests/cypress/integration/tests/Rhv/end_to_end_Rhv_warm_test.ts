import { testrhel8Warm } from './config_separate_mapping_rhv';
import { login } from '../../../utils/utils';
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
  const providerData: RhvProviderData = testrhel8Warm.planData.providerData;

  beforeEach(() => {
    login(testrhel8Warm.loginData);
  });

  it('Login to MTV and create provider', () => {
    provider.create(providerData);
  });

  it('Create new network and storage mapping', () => {
    networkMapping.create(testrhel8Warm.planData.networkMappingData);
    storageMapping.create(testrhel8Warm.planData.storageMappingData);
  });

  it('Creating plan with existing network and storage mapping', () => {
    plan.create(testrhel8Warm.planData);
  });

  it('Running plan created in a previous tests', () => {
    plan.execute(testrhel8Warm.planData);
  });
});
