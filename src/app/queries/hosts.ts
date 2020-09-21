import { QueryResult } from 'react-query';
import { usePollingContext } from '@app/common/context';
import { POLLING_INTERVAL } from './constants';
import { useMockableQuery, getApiUrl } from './helpers';
import { MOCK_HOSTS } from './mocks/hosts.mock';
import { IHost } from './types';
import { useProvidersQuery } from '.';

export const HOSTS_QUERY_KEY = 'hosts';

// TODO handle error messages? (query.status will correctly show 'error', but error messages aren't collected)
export const useHostsQuery = (providerName?: string): QueryResult<IHost[]> => {
  const { isPollingEnabled } = usePollingContext();
  const { data: providers } = useProvidersQuery();
  const currentProvider = providers?.vsphere.find((provider) => provider.name === providerName);

  const result = useMockableQuery<IHost[]>(
    {
      queryKey: providers && HOSTS_QUERY_KEY,
      queryFn: () =>
        fetch(getApiUrl(`${currentProvider?.selfLink || ''}/hosts?detail=true`)).then((res) =>
          res.json()
        ),
      config: {
        enabled: !!currentProvider,
        refetchInterval: isPollingEnabled ? POLLING_INTERVAL : false,
      },
    },
    MOCK_HOSTS
  );
  return {
    ...result,
    data: result.data,
  };
};
