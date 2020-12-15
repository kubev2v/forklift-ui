import { QueryResult } from 'react-query';
import { usePollingContext } from '@app/common/context';
import { useMockableQuery, getInventoryApiUrl, sortIndexedResultsByName } from './helpers';
import { IOpenShiftProvider, IStorageClass, IStorageClassesByProvider, MappingType } from './types';
import { MOCK_STORAGE_CLASSES_BY_PROVIDER } from './mocks/storageClasses.mock';
import { authorizedFetch, useFetchContext } from './fetchHelpers';

export const useStorageClassesQuery = (
  providers: (IOpenShiftProvider | null)[] | null,
  mappingType: MappingType
): QueryResult<IStorageClassesByProvider> => {
  const fetchContext = useFetchContext();
  const definedProviders = providers
    ? (providers.filter((provider) => !!provider) as IOpenShiftProvider[])
    : [];
  const result = useMockableQuery<IStorageClassesByProvider>(
    {
      // Key by the provider names combined, so it refetches if the list of providers changes
      queryKey: ['storageClasses', ...definedProviders.map((provider) => provider.name)],
      // Fetch multiple resources in one query via Promise.all()
      queryFn: async () => {
        const storageClassLists: IStorageClass[][] = await Promise.all(
          (providers || []).map((provider) =>
            authorizedFetch<IStorageClass[]>(
              getInventoryApiUrl(`${provider?.selfLink || ''}/storageclasses`),
              fetchContext
            )
          )
        );
        return definedProviders.reduce(
          (newObj, provider, index) => ({ ...newObj, [provider.name]: storageClassLists[index] }),
          {} as IStorageClassesByProvider
        );
      },
      config: {
        enabled: !!providers && providers.length > 0 && mappingType === MappingType.Storage,
        refetchInterval: usePollingContext().refetchInterval,
      },
    },
    MOCK_STORAGE_CLASSES_BY_PROVIDER
  );
  return sortIndexedResultsByName<IStorageClass, IStorageClassesByProvider>(result);
};
