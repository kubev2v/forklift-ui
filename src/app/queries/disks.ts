import { usePollingContext } from '@app/common/context';
import { UseQueryResult } from 'react-query';
import { useAuthorizedFetch } from './fetchHelpers';
import { useMockableQuery, getInventoryApiUrl } from './helpers';
import { SourceInventoryProvider } from './types';
import { MOCK_DISKS } from '@app/queries/mocks/disks.mock';

export interface IDisk {
  id: string;
  name: string;
  revision: number;
  selfLink: string;
  // properties available with ?detail=1
  storageDomain: string;
}

export const useDisksQuery = (
  provider: SourceInventoryProvider | null
): UseQueryResult<IDisk[]> => {
  return useMockableQuery<IDisk[], unknown>(
    {
      queryKey: ['disks', provider?.selfLink],
      queryFn: useAuthorizedFetch(getInventoryApiUrl(`${provider?.selfLink || ''}/disks?detail=1`)),
      enabled: !!provider && provider.type === 'ovirt',
      refetchInterval: usePollingContext().refetchInterval,
    },
    MOCK_DISKS
  );
};
