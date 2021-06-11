import { usePollingContext } from '@app/common/context';
import { getInventoryApiUrl, sortByName, useMockableQuery } from './helpers';
import { IOpenShiftProvider } from './types';
import { useAuthorizedFetch } from './fetchHelpers';
import { IOpenShiftNamespace } from './types/namespaces.types';
import { MOCK_OPENSHIFT_NAMESPACES } from './mocks/namespaces.mock';

export const useNamespacesQuery = (provider: IOpenShiftProvider | null) => {
  const result = useMockableQuery<IOpenShiftNamespace[]>(
    {
      queryKey: ['namespaces', provider?.name],
      queryFn: useAuthorizedFetch(getInventoryApiUrl(`${provider?.selfLink || ''}/namespaces`)),
      enabled: !!provider,
      refetchInterval: usePollingContext().refetchInterval,
      select: sortByName,
    },
    MOCK_OPENSHIFT_NAMESPACES
  );
  return result;
};
