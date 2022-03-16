import { MappingNetwork } from '../../models/mappingNetwork';
import { editNetworkMapping, editStorageMapping, testData } from './config_separate_mapping_rhv';
import { login } from '../../../utils/utils';
import { MappingStorage } from '../../models/mappingStorage';

describe('CRUD Operations', () => {
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();

  beforeEach(() => {
    login(testData.loginData);
  });

  it('Create new network and storage mappings', () => {
    networkMapping.create(testData.planData.networkMappingData);
    storageMapping.create(testData.planData.storageMappingData);
  });

  it('Edit existing network mapping', () => {
    networkMapping.edit(editNetworkMapping);
  });

  it('Edit existing storage mapping', () => {
    storageMapping.edit(editStorageMapping);
  });

  after(() => {
    networkMapping.delete(testData.planData.networkMappingData);
    storageMapping.delete(testData.planData.storageMappingData);
  });
});
