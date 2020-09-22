import { QueryResult } from 'react-query';
import { usePollingContext } from '@app/common/context';
import { POLLING_INTERVAL } from './constants';
import { useMockableQuery, getApiUrl } from './helpers';
import { MOCK_PROVIDERS } from './mocks/providers.mock';
import { IProvidersByType, Provider } from './types';

export const PROVIDERS_QUERY_KEY = 'providers';

// TODO handle error messages? (query.status will correctly show 'error', but error messages aren't collected)
export const useProvidersQuery = (): QueryResult<IProvidersByType> => {
  const { isPollingEnabled } = usePollingContext();
  const result = useMockableQuery<IProvidersByType>(
    {
      queryKey: PROVIDERS_QUERY_KEY,
      queryFn: () => fetch(getApiUrl('/providers?detail=true')).then((res) => res.json()),
      config: { refetchInterval: isPollingEnabled ? POLLING_INTERVAL : false },
    },
    MOCK_PROVIDERS
  );
  return {
    ...result,
    data: result.data
      ? (Object.keys(result.data || {}).reduce(
          (newObj, key) => ({
            ...newObj,
            [key]: (result.data || {})[key].sort((a: Provider, b: Provider) =>
              a.name < b.name ? -1 : 1
            ),
          }),
          {} as IProvidersByType
        ) as IProvidersByType)
      : undefined,
  };
};
