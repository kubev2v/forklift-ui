import { QueryResult } from 'react-query';
import { usePollingContext } from '@app/common/context';
import { POLLING_INTERVAL } from './constants';
import { useMockableQuery, getApiUrl, sortIndexedData } from './helpers';
import { MOCK_PROVIDERS } from './mocks/providers.mock';
import { IProvidersByType, Provider } from './types';

// TODO handle error messages? (query.status will correctly show 'error', but error messages aren't collected)
export const useProvidersQuery = (): QueryResult<IProvidersByType> => {
  const { isPollingEnabled } = usePollingContext();
  const result = useMockableQuery<IProvidersByType>(
    {
      queryKey: 'providers',
      queryFn: () => fetch(getApiUrl('/providers?detail=true')).then((res) => res.json()),
      config: { refetchInterval: isPollingEnabled ? POLLING_INTERVAL : false },
    },
    MOCK_PROVIDERS
  );
  return {
    ...result,
    data: sortIndexedData<Provider, IProvidersByType>(result.data, (provider) => provider.name),
  };
};
