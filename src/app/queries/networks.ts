import { usePollingContext } from '@app/common/context';
import { QueryResult } from 'react-query';
import { useMockableQuery, getInventoryApiUrl, useResultsSortedByName } from './helpers';
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

export const useNetworksQuery = <T extends ISourceNetwork | IOpenShiftNetwork>(
  provider: InventoryProvider | null,
  providerRole: 'source' | 'target',
  mappingType: MappingType | null,
  mockNetworks: T[]
): QueryResult<T[]> => {
  const apiSlug = providerRole === 'source' ? '/networks' : '/networkattachmentdefinitions';
  const result = useMockableQuery<T[]>(
    {
      queryKey: ['networks', providerRole, provider?.name],
      queryFn: useAuthorizedFetch(getInventoryApiUrl(`${provider?.selfLink || ''}${apiSlug}`)),
      config: {
        enabled: !!provider && (!mappingType || mappingType === MappingType.Network),
        refetchInterval: usePollingContext().refetchInterval,
      },
    },
    mockNetworks
  );
  return useResultsSortedByName(result);
};

export const useSourceNetworksQuery = (
  provider: SourceInventoryProvider | null,
  mappingType?: MappingType
): QueryResult<ISourceNetwork[]> =>
  useNetworksQuery(
    provider,
    'source',
    mappingType || null,
    provider?.type === 'vsphere' ? MOCK_VMWARE_NETWORKS : MOCK_RHV_NETWORKS
  );

export const useOpenShiftNetworksQuery = (
  provider: IOpenShiftProvider | null,
  mappingType?: MappingType
): QueryResult<IOpenShiftNetwork[]> =>
  useNetworksQuery(provider, 'target', mappingType || null, MOCK_OPENSHIFT_NETWORKS);
