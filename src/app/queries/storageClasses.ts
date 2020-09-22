import { QueryResult } from 'react-query';
import { usePollingContext } from '@app/common/context';
import { POLLING_INTERVAL } from './constants';
import { useMockableQuery, getApiUrl } from './helpers';
import { IOpenShiftProvider, IStorageClass } from './types';
import { MOCK_STORAGE_CLASSES_BY_PROVIDER } from './mocks/storageClasses.mock';

export const STORAGE_CLASSES_QUERY_KEY = 'storageClasses';

// TODO handle error messages? (query.status will correctly show 'error', but error messages aren't collected)
export const useStorageClassesQuery = (
  provider: IOpenShiftProvider | null
): QueryResult<IStorageClass[]> => {
  const { isPollingEnabled } = usePollingContext();
  const result = useMockableQuery<IStorageClass[]>(
    {
      queryKey: `${STORAGE_CLASSES_QUERY_KEY}-${provider?.name || ''}`,
      queryFn: () =>
        fetch(getApiUrl(`${provider?.selfLink || ''}/storageclasses`)).then((res) => res.json()),
      config: {
        enabled: !!provider, // Don't fetch until a provider is selected / defined
        refetchInterval: isPollingEnabled ? POLLING_INTERVAL : false,
      },
    },
    MOCK_STORAGE_CLASSES_BY_PROVIDER[provider?.name || '']
  );
  return {
    ...result,
    data: result.data
      ? result.data.sort((a: IStorageClass, b: IStorageClass) => (a.name < b.name ? -1 : 1))
      : undefined,
  };
};
