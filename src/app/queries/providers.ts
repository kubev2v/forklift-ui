import { QueryResult } from 'react-query';
import { useMockableQuery, getApiUrl } from './helpers';
import { MOCK_PROVIDERS } from './mocks/providers.mock';
import { IProvidersByType } from './types';

// TODO handle error responses?
export const useProvidersQuery = (): QueryResult<IProvidersByType> =>
  useMockableQuery(
    {
      queryKey: 'providers',
      queryFn: () => fetch(getApiUrl('/providers?detail=true')).then((res) => res.json()),
    },
    MOCK_PROVIDERS
  );
