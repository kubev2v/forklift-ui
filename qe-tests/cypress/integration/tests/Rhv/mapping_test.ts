import { MappingNetwork } from '../../models/mappingNetwork';
import { testData } from './config_separate_mapping_rhv';
import { login } from '../../../utils/utils';
import { MappingStorage } from '../../models/mappingStorage';

describe('Create new Network and Storage mappings', () => {
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();

  beforeEach(() => {
    login(testData.loginData);
  });

  it('Create new network mapping', () => {
    networkMapping.create(testData.planData.networkMappingData);
  });

  it('Create new storage mapping', () => {
    storageMapping.create(testData.planData.storageMappingData);
  });

  it.skip('Remove network mapping', () => {
    networkMapping.delete(testData.planData.networkMappingData);
  });

  it.skip('Remove storage mapping', () => {
    storageMapping.delete(testData.planData.storageMappingData);
  });
});
