import { ProviderVmware } from '../../models/providerVmware';
import { testData } from './config';
import { login } from '../../../utils/utils';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';
import { Plan } from '../../models/plan';

describe('End to End test, creating provider, mapping, plan, running plan and deleting at the end', () => {
  const provider = new ProviderVmware();
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();
  const plan = new Plan();
  // const instances = [provider, networkMapping, storageMapping, plan];

  beforeEach(() => {
    login(testData.loginData);
  });

  it('Login to MTV and create provider', () => {
    provider.create(testData.planData.providerData);
  });

  it('Create new network and storage mapping', () => {
    networkMapping.create(testData.planData.networkMappingData);
    storageMapping.create(testData.planData.storageMappingData);
  });

  it('Creating plan with existing network and storage mapping', () => {
    plan.create(testData.planData);
  });

  // it('Clearing resources by deleting mappings, provider and plan', () => {
  //   instances.forEach((instance) => {
  //     instance.delete();
  //   });
  // });
});
