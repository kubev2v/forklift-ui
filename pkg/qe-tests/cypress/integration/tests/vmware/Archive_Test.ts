import { login } from '../../../utils/utils';
import { Plan } from '../../models/plan';
import { testData } from './config_separate_mapping';
import { ProviderVmware } from '../../models/providerVmware';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';

describe('Automate archive migration plan test', () => {
  const source = new ProviderVmware();
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();
  const plan = new Plan();

  beforeEach(() => {
    login(testData.loginData);
    source.create(testData.planData.providerData);
    networkMapping.create(testData.planData.networkMappingData);
    storageMapping.create(testData.planData.storageMappingData);
    plan.create(testData.planData);
    plan.failed(testData.planData);
  });

  it('Archiving plan', () => {
    plan.archive(testData.planData);
  });
  it('Delete Duplicated Plan', () => {
    plan.delete(testData.planData);
  });

  it('Deleting Archived plan', () => {
    plan.deleteArchive(testData.planData);
  });

  after(() => {
    networkMapping.delete(testData.planData.networkMappingData);
    storageMapping.delete(testData.planData.storageMappingData);
    source.delete(testData.planData.providerData);
  });
});
