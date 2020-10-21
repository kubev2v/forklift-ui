import { usePollingContext } from '@app/common/context';
import { QueryResult } from 'react-query';
import { POLLING_INTERVAL } from './constants';
import { getInventoryApiUrl, sortResultsByName, useMockableQuery } from './helpers';
import { IOpenShiftProvider } from './types';
import { useAuthorizedFetch } from './fetchHelpers';
import { IOpenShiftNamespace } from './types/namespaces.types';
import { MOCK_OPENSHIFT_NAMESPACES } from './mocks/namespaces.mock';

export const useNamespacesQuery = (
  provider: IOpenShiftProvider | null
): QueryResult<IOpenShiftNamespace[]> => {
  const result = useMockableQuery<IOpenShiftNamespace[]>(
    {
      queryKey: `namespaces:${provider?.name}`,
      queryFn: useAuthorizedFetch(getInventoryApiUrl(`${provider?.selfLink || ''}/namespaces`)),
      config: {
        enabled: !!provider,
        refetchInterval: usePollingContext().isPollingEnabled ? POLLING_INTERVAL : false,
      },
    },
    MOCK_OPENSHIFT_NAMESPACES
  );
  return sortResultsByName(result);
};
