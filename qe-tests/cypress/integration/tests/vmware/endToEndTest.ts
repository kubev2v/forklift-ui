import { ProviderVmware } from '../../models/providerVmware';
import { testData } from './config';
import { login } from '../../../utils/utils';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';
import { Plan } from '../../models/plan';

describe('End to End test, creating provider, mapping, plan, running plan and deleting at the end', () => {
  const provider = new ProviderVmware(testData.planData.providerData);
  const networkMapping = new MappingNetwork(testData.planData.networkMappingData);
  const storageMapping = new MappingStorage(testData.planData.storageMappingData);
  const plan = new Plan(testData.planData);
  const instances = [provider, networkMapping, storageMapping, plan];

  beforeEach(() => {
    login(testData.loginData);
  });

  it('Login to MTV and create provider', () => {
    provider.create();
  });

  it('Create new network and storage mapping', () => {
    networkMapping.create();
    storageMapping.create();
  });

  it('Creating plan with existing network and storage mapping', () => {
    plan.create();
  });

  it('Clearing resources by deleting mappings, provider and plan', () => {
    instances.forEach((instance) => {
      instance.delete();
    });
  });
});
