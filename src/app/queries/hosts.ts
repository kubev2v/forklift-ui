import { QueryResult } from 'react-query';
import { usePollingContext } from '@app/common/context';
import { useMockableQuery, getInventoryApiUrl, sortResultsByName } from './helpers';
import { MOCK_HOSTS } from './mocks/hosts.mock';
import { IHost } from './types';
import { useProvidersQuery } from '.';
import { useAuthorizedFetch } from './fetchHelpers';

// TODO handle error messages? (query.status will correctly show 'error', but error messages aren't collected)
export const useHostsQuery = (providerName?: string): QueryResult<IHost[]> => {
  const { data: providers } = useProvidersQuery();
  const currentProvider = providers?.vsphere.find((provider) => provider.name === providerName);

  const result = useMockableQuery<IHost[]>(
    {
      queryKey: 'hosts',
      queryFn: useAuthorizedFetch(
        getInventoryApiUrl(`${currentProvider?.selfLink || ''}/hosts?detail=true`)
      ),
      config: {
        enabled: !!currentProvider,
        refetchInterval: usePollingContext().refetchInterval,
      },
    },
    MOCK_HOSTS
  );
  return sortResultsByName<IHost>(result);
};
