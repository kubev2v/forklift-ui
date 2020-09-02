export const updateMockStorage = (params: any) => {
  const { mappingName, sourceProvider, targetProvider } = params;
  const mappingsKey = localStorage.getItem('mappingsObject' || '{}');
  const currentMappings = mappingsKey !== null ? JSON.parse(mappingsKey) : {};
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
  localStorage.setItem('mappingsObject', JSON.stringify(mockMappings));
};
