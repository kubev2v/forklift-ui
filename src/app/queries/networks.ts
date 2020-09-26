import { usePollingContext } from '@app/common/context';
import { QueryResult } from 'react-query';
import { POLLING_INTERVAL } from './constants';
import { useMockableQuery, getApiUrl, sortResultsByName } from './helpers';
import { MOCK_OPENSHIFT_NETWORKS, MOCK_VMWARE_NETWORKS } from './mocks/networks.mock';
import { IOpenShiftNetwork, IOpenShiftProvider, IVMwareNetwork, IVMwareProvider } from './types';

// TODO handle error messages? (query.status will correctly show 'error', but error messages aren't collected)
export const useVMwareNetworksQuery = (
  provider: IVMwareProvider | null
): QueryResult<IVMwareNetwork[]> => {
  const result = useMockableQuery<IVMwareNetwork[]>(
    {
      queryKey: `vmware-networks:${provider?.name}`,
      queryFn: () =>
        fetch(getApiUrl(`${provider?.selfLink || ''}/networks`)).then((res) => res.json()),
      config: {
        enabled: !!provider,
        refetchInterval: usePollingContext().isPollingEnabled ? POLLING_INTERVAL : false,
      },
    },
    MOCK_VMWARE_NETWORKS
  );
  return sortResultsByName(result);
};

// TODO handle error messages? (query.status will correctly show 'error', but error messages aren't collected)
export const useOpenShiftNetworksQuery = (
  provider: IOpenShiftProvider | null
): QueryResult<IOpenShiftNetwork[]> => {
  const result = useMockableQuery<IOpenShiftNetwork[]>(
    {
      queryKey: `openshift-networks:${provider?.name}`,
      queryFn: () =>
        fetch(getApiUrl(`${provider?.selfLink || ''}/networkattachmentdefinitions`)).then((res) =>
          res.json()
        ),
      config: {
        enabled: !!provider,
        refetchInterval: usePollingContext().isPollingEnabled ? POLLING_INTERVAL : false,
      },
    },
    MOCK_OPENSHIFT_NETWORKS
  );
  return sortResultsByName(result);
};
