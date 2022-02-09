import { login } from '../../../utils/utils';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';
import { Plan } from '../../models/plan';
import { providerRhv } from '../../models/providerRhv';
import { testData } from './config_separate_mapping_rhv';

describe('Automate cancel and restart of cold migration test', () => {
  const source = new providerRhv();
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();
  const plan = new Plan();

  beforeEach(() => {
    login(testData.loginData);
    source.create(testData.planData.providerData);
    networkMapping.create(testData.planData.networkMappingData);
    storageMapping.create(testData.planData.storageMappingData);
    plan.create(testData.planData);
  });

  it('Cancel and restart migration', () => {
    plan.cancel_and_restart(testData.planData);
  });

  it.skip('cancel and Restart at Transfer Disk Step', () => {
    plan.cancelRestartAtTransferDisks(testData.planData);
  });

  it.skip('cancel and Restart at Convert to Image Step', () => {
    plan.cancelRestartAtKubevirt(testData.planData);
  });

  afterEach(() => {
    plan.delete(testData.planData);
    networkMapping.delete(testData.planData.networkMappingData);
    storageMapping.delete(testData.planData.storageMappingData);
    source.delete(testData.planData.providerData);
  });
});
