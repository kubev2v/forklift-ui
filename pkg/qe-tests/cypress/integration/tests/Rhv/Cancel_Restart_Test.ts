import { login } from '../../../utils/utils';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';
import { Plan } from '../../models/plan';
import { providerRhv } from '../../models/providerRhv';
import { testrhel8Cold } from './config_separate_mapping_rhv';

describe('Automate cancel and restart of cold migration test', () => {
  const source = new providerRhv();
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();
  const plan = new Plan();

  beforeEach(() => {
    login(testrhel8Cold.loginData);
    source.create(testrhel8Cold.planData.providerData);
    networkMapping.create(testrhel8Cold.planData.networkMappingData);
    storageMapping.create(testrhel8Cold.planData.storageMappingData);
    plan.create(testrhel8Cold.planData);
  });

  it('Cancel and restart migration', () => {
    plan.cancel_and_restart(testrhel8Cold.planData);
  });

  it.skip('cancel and Restart at Transfer Disk Step', () => {
    plan.cancelRestartAtTransferDisks(testrhel8Cold.planData);
  });

  it.skip('cancel and Restart at Convert to Image Step', () => {
    plan.cancelRestartAtKubevirt(testrhel8Cold.planData);
  });

  afterEach(() => {
    plan.delete(testrhel8Cold.planData);
    networkMapping.delete(testrhel8Cold.planData.networkMappingData);
    storageMapping.delete(testrhel8Cold.planData.storageMappingData);
    source.delete(testrhel8Cold.planData.providerData);
  });
});
