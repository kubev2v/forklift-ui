import { usePollingContext } from '@app/common/context';
import { useMockableQuery, getInventoryApiUrl } from './helpers';
import { InventoryProvider } from './types';
import { useAuthorizedFetch } from './fetchHelpers';
import { IDataCenter } from '@app/queries/types/datacenters.types';

export const useDataCentersQuery = <T extends IDataCenter>(provider: InventoryProvider | null) => {
  const result = useMockableQuery<T[]>(
    {
      queryKey: ['datacenters', provider?.name],
      queryFn: useAuthorizedFetch(getInventoryApiUrl(`${provider?.selfLink || ''}/datacenters`)),
      enabled: !!provider,
      refetchInterval: usePollingContext().refetchInterval,
    },
    []
  );
  return result;
};
