import { QueryResult } from 'react-query';
import { usePollingContext } from '@app/common/context';
import { POLLING_INTERVAL } from './constants';
import { useMockableQuery, getApiUrl, sortIndexedResultsByName } from './helpers';
import { IOpenShiftProvider, IStorageClass, IStorageClassesByProvider, MappingType } from './types';
import { MOCK_STORAGE_CLASSES_BY_PROVIDER } from './mocks/storageClasses.mock';
import { authorizedFetch, useFetchContext } from './fetchHelpers';

// TODO handle error messages? (query.status will correctly show 'error', but error messages aren't collected)
export const useStorageClassesQuery = (
  providers: IOpenShiftProvider[] | null,
  mappingType: MappingType
): QueryResult<IStorageClassesByProvider> => {
  const fetchContext = useFetchContext();
  const result = useMockableQuery<IStorageClassesByProvider>(
    {
      // Key by the provider names combined, so it refetches if the list of providers changes
      queryKey: `storageClasses:${(providers || []).map((provider) => provider.name).join(',')}`,
      // Fetch multiple resources in one query via Promise.all()
      queryFn: async () => {
        const storageClassLists: IStorageClass[][] = await Promise.all(
          (providers || []).map((provider) =>
            authorizedFetch<IStorageClass[]>(
              getApiUrl(`${provider?.selfLink || ''}/storageclasses`),
              fetchContext
            )
          )
        );
        return (providers || []).reduce(
          (newObj, provider, index) => ({ ...newObj, [provider.name]: storageClassLists[index] }),
          {} as IStorageClassesByProvider
        );
      },
      config: {
        enabled: !!providers && providers.length > 0 && mappingType === MappingType.Storage,
        refetchInterval: usePollingContext().isPollingEnabled ? POLLING_INTERVAL : false,
      },
    },
    MOCK_STORAGE_CLASSES_BY_PROVIDER
  );
  return sortIndexedResultsByName<IStorageClass, IStorageClassesByProvider>(result);
};
