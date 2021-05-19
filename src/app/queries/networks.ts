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
    providerType === ProviderType.vsphere ? '/networks' : '/networkattachmentdefinitions';
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
  useNetworksQuery(provider, ProviderType.vsphere, mappingType || null, MOCK_VMWARE_NETWORKS);

export const useOpenShiftNetworksQuery = (
  provider: IOpenShiftProvider | null,
  mappingType?: MappingType
): QueryResult<IOpenShiftNetwork[]> =>
  useNetworksQuery(provider, ProviderType.openshift, mappingType || null, MOCK_OPENSHIFT_NETWORKS);
