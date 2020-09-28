import { usePollingContext } from '@app/common/context';
import { ProviderType } from '@app/common/constants';
import { QueryResult } from 'react-query';
import { POLLING_INTERVAL } from './constants';
import { useMockableQuery, getApiUrl, sortResultsByName } from './helpers';
import { MOCK_OPENSHIFT_NETWORKS, MOCK_VMWARE_NETWORKS } from './mocks/networks.mock';
import {
  IOpenShiftNetwork,
  IOpenShiftProvider,
  IVMwareNetwork,
  IVMwareProvider,
  MappingType,
  Provider,
} from './types';

// TODO handle error messages? (query.status will correctly show 'error', but error messages aren't collected)
export const useNetworksQuery = <T extends IVMwareNetwork | IOpenShiftNetwork>(
  provider: Provider | null,
  providerType: ProviderType,
  mappingType: MappingType,
  mockNetworks: T[]
): QueryResult<T[]> => {
  const apiSlug =
    providerType === ProviderType.vsphere ? '/networks' : '/networkattachmentdefinitions';
  const result = useMockableQuery<T[]>(
    {
      queryKey: `networks:${providerType}/${provider?.name}`,
      queryFn: () =>
        fetch(getApiUrl(`${provider?.selfLink || ''}${apiSlug}`)).then((res) => res.json()),
      config: {
        enabled: !!provider && mappingType === MappingType.Network,
        refetchInterval: usePollingContext().isPollingEnabled ? POLLING_INTERVAL : false,
      },
    },
    mockNetworks
  );
  return sortResultsByName<T>(result);
};

export const useVMwareNetworksQuery = (
  provider: IVMwareProvider | null,
  mappingType: MappingType
): QueryResult<IVMwareNetwork[]> =>
  useNetworksQuery(provider, ProviderType.vsphere, mappingType, MOCK_VMWARE_NETWORKS);

export const useOpenShiftNetworksQuery = (
  provider: IOpenShiftProvider | null,
  mappingType: MappingType
): QueryResult<IOpenShiftNetwork[]> =>
  useNetworksQuery(provider, ProviderType.openshift, mappingType, MOCK_OPENSHIFT_NETWORKS);
