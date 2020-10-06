import { QueryResult } from 'react-query';
import { usePollingContext } from '@app/common/context';
import { POLLING_INTERVAL } from './constants';
import { useMockableQuery, getApiUrl, sortResultsByName } from './helpers';
import { MOCK_HOSTS } from './mocks/hosts.mock';
import { IHost } from './types';
import { useProvidersQuery } from '.';
import { useFetch } from './useFetch';

export const HOSTS_QUERY_KEY = 'hosts';

// TODO handle error messages? (query.status will correctly show 'error', but error messages aren't collected)
export const useHostsQuery = (providerName?: string): QueryResult<IHost[]> => {
  const { isPollingEnabled } = usePollingContext();
  const { data: providers } = useProvidersQuery();
  const currentProvider = providers?.vsphere.find((provider) => provider.name === providerName);

  const result = useMockableQuery<IHost[]>(
    {
      queryKey: providers && HOSTS_QUERY_KEY,
      queryFn: useFetch(getApiUrl(`${currentProvider?.selfLink || ''}/hosts?detail=true`)),
      config: {
        enabled: !!currentProvider,
        refetchInterval: isPollingEnabled ? POLLING_INTERVAL : false,
      },
    },
    MOCK_HOSTS
  );
  return sortResultsByName<IHost>(result);
};
