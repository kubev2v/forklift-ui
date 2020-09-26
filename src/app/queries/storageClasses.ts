import { QueryResult } from 'react-query';
import { usePollingContext } from '@app/common/context';
import { POLLING_INTERVAL } from './constants';
import { useMockableQuery, getApiUrl, sortIndexedResultsByName } from './helpers';
import { IOpenShiftProvider, IStorageClass, IStorageClassesByProvider } from './types';
import { MOCK_STORAGE_CLASSES_BY_PROVIDER } from './mocks/storageClasses.mock';

// TODO handle error messages? (query.status will correctly show 'error', but error messages aren't collected)
export const useStorageClassesQuery = (
  providers: IOpenShiftProvider[] | null
): QueryResult<IStorageClassesByProvider> => {
  const result = useMockableQuery<IStorageClassesByProvider>(
    {
      // Key by the provider names combined, so it refetches if the list of providers changes
      queryKey: `storageClasses:${(providers || []).map((provider) => provider.name).join(',')}`,
      // Fetch multiple resources in one query via Promise.all()
      queryFn: async () => {
        const storageClassLists: IStorageClass[][] = await Promise.all(
          (providers || []).map((provider) =>
            fetch(getApiUrl(`${provider?.selfLink || ''}/storageclasses`)).then((res) => res.json())
          )
        );
        return (providers || []).reduce(
          (newObj, provider, index) => ({ ...newObj, [provider.name]: storageClassLists[index] }),
          {} as IStorageClassesByProvider
        );
      },
      config: {
        enabled: !!providers, // Don't fetch until providers are selected / defined
        refetchInterval: usePollingContext().isPollingEnabled ? POLLING_INTERVAL : false,
      },
    },
    MOCK_STORAGE_CLASSES_BY_PROVIDER
  );
  return sortIndexedResultsByName<IStorageClass, IStorageClassesByProvider>(result);
};
