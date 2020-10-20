import { MappingType, Mapping } from '../types/mappings.types';

// TODO remove this too

export const fetchMockStorage = (mappingType: string): Mapping[] => {
  const mappingsKey =
    mappingType === MappingType.Network ? 'networkMappingsObject' : 'storageMappingsObject';
  const mappingsItem = localStorage.getItem(mappingsKey);
  const returnVal = JSON.parse(mappingsItem || '{}').mappings;
  return returnVal || [];
};
