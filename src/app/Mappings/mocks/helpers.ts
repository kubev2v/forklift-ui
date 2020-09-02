import { MappingType } from '../types';

export const updateMockStorage = (params: any) => {
  const { mappingName, sourceProvider, targetProvider, mappingType } = params;
  const mappingsKey =
    mappingType === MappingType.Network ? 'networkMappingsObject' : 'storageMappingsObject';
  const mappingsStorageItem = localStorage.getItem(mappingsKey);
  const currentMappings = mappingsKey !== null ? JSON.parse(mappingsStorageItem || '{}') : {};
  const mockMappings = {
    mappings: [
      {
        name: mappingName ? mappingName : 'name1',
        sourceProvider: {
          name: sourceProvider ? sourceProvider.metadata.name : 'test1',
        },
        targetProvider: {
          name: targetProvider ? targetProvider.metadata.name : 'test2',
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
