import { MappingNetwork } from '../../models/mappingNetwork';
import { testData } from './config_separate_mapping';
import { login } from '../../../utils/utils';
import { MappingStorage } from '../../models/mappingStorage';

describe('Create new Network and Storage mappings', () => {
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();

  beforeEach(() => {
    login(testData.loginData);
  });

  it('Remove network mapping', () => {
    networkMapping.delete(testData.planData.networkMappingData);
  });

  it('Remove storage mapping', () => {
    storageMapping.delete(testData.planData.storageMappingData);
  });
});
