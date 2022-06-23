import { MappingNetwork } from '../../models/mappingNetwork';
import { testrhel8Cold } from './config_separate_mapping_rhv';
import { login } from '../../../utils/utils';
import { MappingStorage } from '../../models/mappingStorage';

describe('Create new Network and Storage mappings', () => {
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();

  beforeEach(() => {
    login(testrhel8Cold.loginData);
  });

  it('Create new network mapping', () => {
    networkMapping.create(testrhel8Cold.planData.networkMappingData);
  });

  it('Create new storage mapping', () => {
    storageMapping.create(testrhel8Cold.planData.storageMappingData);
  });

  it.skip('Remove network mapping', () => {
    networkMapping.delete(testrhel8Cold.planData.networkMappingData);
  });

  it.skip('Remove storage mapping', () => {
    storageMapping.delete(testrhel8Cold.planData.storageMappingData);
  });
});
