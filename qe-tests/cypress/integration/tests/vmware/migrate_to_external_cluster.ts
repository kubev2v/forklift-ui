import { login } from '../../../utils/utils';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';
import { Plan } from '../../models/plan';
import { loginData, tData } from './config_forexternal_cluster';
import { ProviderocpV } from '../../models/providerocpV';
import { ProviderVmware } from '../../models/providerVmware';

describe('Migrate VMware VM to external cluster', () => {
  const target = new ProviderocpV();
  const source = new ProviderVmware();
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();
  const plan = new Plan();

  before(() => {
    login(loginData);
    target.create(tData.planData.targetprovider);
    source.create(tData.planData.providerData);
    networkMapping.create(tData.planData.networkMappingData);
    storageMapping.create(tData.planData.storageMappingData);
    plan.create(tData.planData);
  });

  it('Create plan using existing mappings and run migration plan', () => {
    plan.execute(tData.planData);
  });

  after(() => {
    plan.delete(tData.planData);
    networkMapping.delete(tData.planData.networkMappingData);
    storageMapping.delete(tData.planData.storageMappingData);
    target.delete(tData.planData.providerData);
    source.delete(tData.planData.providerData);
  });
});
