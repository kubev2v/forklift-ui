import { QueryResult } from 'react-query';
import { usePollingContext } from '@app/common/context';
import { POLLING_INTERVAL } from './constants';
import { useMockableQuery, getApiUrl, sortIndexedData } from './helpers';
import { IOpenShiftProvider, IStorageClass, IStorageClassesByProvider } from './types';
import { MOCK_STORAGE_CLASSES_BY_PROVIDER } from './mocks/storageClasses.mock';

export const STORAGE_CLASSES_QUERY_KEY = 'storageClasses';

// TODO handle error messages? (query.status will correctly show 'error', but error messages aren't collected)
export const useStorageClassesQuery = (
  providers: IOpenShiftProvider[] | null
): QueryResult<IStorageClassesByProvider> => {
  const { isPollingEnabled } = usePollingContext();
  // Key by the provider names combined, so it refetches if the list of providers changes
  const queryKey = `${STORAGE_CLASSES_QUERY_KEY}:${(providers || [])
    .map((provider) => provider.name)
    .join(',')}`;

  const indexedMockStorageClasses = (providers || []).reduce(
    (newObj, provider) => ({
      ...newObj,
      [provider.name]: MOCK_STORAGE_CLASSES_BY_PROVIDER[provider.name],
    }),
    {} as IStorageClassesByProvider
  );

  const result = useMockableQuery<IStorageClassesByProvider>(
    {
      queryKey: queryKey,
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
        refetchInterval: isPollingEnabled ? POLLING_INTERVAL : false,
      },
    },
    indexedMockStorageClasses
  );
  return {
    ...result,
    data: sortIndexedData<IStorageClass, IStorageClassesByProvider>(result.data, (sc) => sc.name),
  };
};
