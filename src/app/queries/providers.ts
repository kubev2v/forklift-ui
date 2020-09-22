import { QueryResult } from 'react-query';
import { POLLING_INTERVAL } from './constants';
import { useMockableQuery, getApiUrl } from './helpers';
import { MOCK_PROVIDERS } from './mocks/providers.mock';
import { IProvidersByType } from './types';

// TODO handle error responses?
export const useProvidersQuery = (): QueryResult<IProvidersByType> =>
  useMockableQuery<IProvidersByType>(
    {
      queryKey: 'providers',
      queryFn: () => fetch(getApiUrl('/providers?detail=true')).then((res) => res.json()),
      config: { refetchInterval: POLLING_INTERVAL },
    },
    MOCK_PROVIDERS
  );
