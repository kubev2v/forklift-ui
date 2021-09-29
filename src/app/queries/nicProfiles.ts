import { usePollingContext } from '@app/common/context';
import { UseQueryResult } from 'react-query';
import { useAuthorizedFetch } from './fetchHelpers';
import { useMockableQuery, getInventoryApiUrl } from './helpers';
import { SourceInventoryProvider } from './types';
import { MOCK_NIC_PROFILES } from '@app/queries/mocks/nicProfiles.mock';

export interface INicProfile {
  id: string;
  name: string;
  revision: number;
  selfLink: string;
  // properties available with ?detail=1
  network: string; // the network id
}

export const useNicProfilesQuery = (
  provider: SourceInventoryProvider | null
): UseQueryResult<INicProfile[]> => {
  return useMockableQuery<INicProfile[], unknown>(
    {
      queryKey: ['nicProfiles', provider?.selfLink],
      queryFn: useAuthorizedFetch(
        getInventoryApiUrl(`${provider?.selfLink || ''}/nicprofiles?detail=1`)
      ),
      enabled: !!provider && provider.type === 'ovirt',
      refetchInterval: usePollingContext().refetchInterval,
    },
    MOCK_NIC_PROFILES
  );
};
