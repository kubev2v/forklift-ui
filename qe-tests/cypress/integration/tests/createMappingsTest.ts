import { MappingNetwork } from '../models/mappingNetwork';
import { testData } from './config';
import { login } from '../../utils/utils';
import { MappingStorage } from '../models/mappingStorage';

describe('Create new Network and Storage mappings', () => {
  const networkMapping = new MappingNetwork(testData.planData.networkMappingData[0]);
  const storageMapping = new MappingStorage(testData.planData.storageMappingData[0]);
  it('Create new network mapping', () => {
    login(testData.loginData);
    networkMapping.create();
  });

  it('Create new storage mapping', () => {
    login(testData.loginData);
    storageMapping.create();
  });

  it('Remove network mapping', () => {
    login(testData.loginData);
    networkMapping.delete();
  });

  it('Remove storage mapping', () => {
    login(testData.loginData);
    storageMapping.delete();
  });
});
