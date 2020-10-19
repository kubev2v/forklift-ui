import { QueryResult } from 'react-query';
import { usePollingContext } from '@app/common/context';
import { POLLING_INTERVAL } from './constants';
import { useAuthorizedFetch } from './fetchHelpers';
import { sortResultsByName, useMockableQuery, getInventoryApiUrl } from './helpers';
import { MOCK_VMWARE_VMS } from './mocks/vms.mock';
import { IVMwareProvider } from './types';
import { IVMwareVM } from './types/vms.types';

export const useVMwareVMsQuery = (provider: IVMwareProvider | null): QueryResult<IVMwareVM[]> => {
  const result = useMockableQuery<IVMwareVM[]>(
    {
      queryKey: `vms:${provider?.name}`,
      queryFn: useAuthorizedFetch(
        getInventoryApiUrl(`${provider?.selfLink || ''}/vms?detail=true`)
      ),
      config: {
        enabled: !!provider,
        refetchInterval: usePollingContext().isPollingEnabled ? POLLING_INTERVAL : false,
      },
    },
    MOCK_VMWARE_VMS
  );
  return sortResultsByName(result);
};
