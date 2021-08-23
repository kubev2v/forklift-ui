import * as React from 'react';
import { usePollingContext } from '@app/common/context';
import { useMockableQuery, getInventoryApiUrl, sortByName } from './helpers';
import {
  MOCK_OPENSHIFT_NETWORKS,
  MOCK_RHV_NETWORKS,
  MOCK_VMWARE_NETWORKS,
} from './mocks/networks.mock';
import {
  IOpenShiftNetwork,
  IOpenShiftProvider,
  ISourceNetwork,
  MappingType,
  InventoryProvider,
  SourceInventoryProvider,
} from './types';
import { useAuthorizedFetch } from './fetchHelpers';
// import { useDataCentersQuery } from '@app/queries';

export const useNetworksQuery = <T extends ISourceNetwork | IOpenShiftNetwork>(
  provider: InventoryProvider | null,
  providerRole: 'source' | 'target',
  mappingType: MappingType | null,
  mockNetworks: T[]
) => {
  const apiSlug =
    providerRole === 'source' ? '/networks?detail=1' : '/networkattachmentdefinitions';
  const sortByNameCallback = React.useCallback((data): T[] => {
    // console.log('networkQuery callback', data);
    return sortByName(data);
  }, []);
  const result = useMockableQuery<T[]>(
    {
      queryKey: ['networks', providerRole, provider?.name],
      queryFn: useAuthorizedFetch(getInventoryApiUrl(`${provider?.selfLink || ''}${apiSlug}`)),
      enabled: !!provider && (!mappingType || mappingType === MappingType.Network),
      refetchInterval: usePollingContext().refetchInterval,
      select: sortByNameCallback,
    },
    mockNetworks
  );
  return result;
};

export const useSourceNetworksQuery = (
  provider: SourceInventoryProvider | null,
  mappingType?: MappingType
) => {
  return useNetworksQuery(
    provider,
    'source',
    mappingType || null,
    provider?.type === 'vsphere' ? MOCK_VMWARE_NETWORKS : MOCK_RHV_NETWORKS
  );
};

export const useOpenShiftNetworksQuery = (
  provider: IOpenShiftProvider | null,
  mappingType?: MappingType
) => useNetworksQuery(provider, 'target', mappingType || null, MOCK_OPENSHIFT_NETWORKS);
