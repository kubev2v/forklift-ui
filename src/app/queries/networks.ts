import { usePollingContext } from '@app/common/context';
import { ProviderType } from '@app/common/constants';
import { QueryResult } from 'react-query';
import { useMockableQuery, getInventoryApiUrl, useResultsSortedByName } from './helpers';
import { MOCK_OPENSHIFT_NETWORKS, MOCK_VMWARE_NETWORKS } from './mocks/networks.mock';
import {
  IOpenShiftNetwork,
  IOpenShiftProvider,
  IVMwareNetwork,
  IVMwareProvider,
  MappingType,
  InventoryProvider,
} from './types';
import { useAuthorizedFetch } from './fetchHelpers';

export const useNetworksQuery = <T extends IVMwareNetwork | IOpenShiftNetwork>(
  provider: InventoryProvider | null,
  providerType: ProviderType,
  mappingType: MappingType | null,
  mockNetworks: T[]
): QueryResult<T[]> => {
  const apiSlug =
    providerType === 'vsphere' || providerType === 'ovirt'
      ? '/networks'
      : '/networkattachmentdefinitions';
  const result = useMockableQuery<T[]>(
    {
      queryKey: ['networks', providerType, provider?.name],
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

export const useVMwareNetworksQuery = (
  provider: IVMwareProvider | null,
  mappingType?: MappingType
): QueryResult<IVMwareNetwork[]> =>
  useNetworksQuery(provider, 'vsphere', mappingType || null, MOCK_VMWARE_NETWORKS);

// TODO add useRHVNetworksQuery or consolidate to useSourceNetworksQuery. Maybe we need 'source' | 'target' instead of providerType for logic above.

export const useOpenShiftNetworksQuery = (
  provider: IOpenShiftProvider | null,
  mappingType?: MappingType
): QueryResult<IOpenShiftNetwork[]> =>
  useNetworksQuery(provider, 'openshift', mappingType || null, MOCK_OPENSHIFT_NETWORKS);
