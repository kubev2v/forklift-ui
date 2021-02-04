import { MappingNetwork } from '../models/mappingNetwork';
import { testData } from './config';
import { login } from '../../utils/utils';
import { MappingStorage } from '../models/mappingStorage';

describe('Create new Network and Storage mappings', () => {
  const networkMapping = new MappingNetwork(testData.planData.networkMappingData);
  const storageMapping = new MappingStorage(testData.planData.storageMappingData);

  beforeEach(() => {
    login(testData.loginData);
  });

  it('Create new network mapping', () => {
    networkMapping.create();
  });

  it('Create new storage mapping', () => {
    storageMapping.create();
  });

  it.skip('Remove network mapping', () => {
    networkMapping.delete();
  });

  it.skip('Remove storage mapping', () => {
    storageMapping.delete();
  });
});
