import { MappingType, Mapping } from '../types';

export const updateMockStorage = (generatedMapping: Mapping) => {
  const { name: mappingName, provider, type: mappingType, items } = generatedMapping;
  const mappingsKey =
    mappingType === MappingType.Network ? 'networkMappingsObject' : 'storageMappingsObject';
  const mappingsStorageItem = localStorage.getItem(mappingsKey);
  const currentMappings = mappingsKey !== null ? JSON.parse(mappingsStorageItem || '{}') : {};
  const mockMappings = {
    mappings: [
      {
        name: mappingName ? mappingName : 'name1',
        provider: {
          source: {
            name: provider.source.name,
          },
          target: {
            name: provider.source.name,
          },
        },
      },
      ...(currentMappings?.mappings ? currentMappings.mappings : []),
    ],
  };
  localStorage.setItem(mappingsKey, JSON.stringify(mockMappings));
};

export const fetchMockStorage = (mappingType: string) => {
  const mappingsKey =
    mappingType === MappingType.Network ? 'networkMappingsObject' : 'storageMappingsObject';
  const mappingsItem = localStorage.getItem(mappingsKey);
  const returnVal = JSON.parse(mappingsItem || '{}').mappings;
  return returnVal;
};
