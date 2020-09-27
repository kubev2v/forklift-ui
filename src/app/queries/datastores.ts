import { usePollingContext } from '@app/common/context';
import { QueryResult } from 'react-query';
import { POLLING_INTERVAL } from './constants';
import { getApiUrl, sortResultsByName, useMockableQuery } from './helpers';
import { MOCK_VMWARE_DATASTORES } from './mocks/datastores.mock';
import { IVMwareDatastore, IVMwareProvider } from './types';

export const useDatastoresQuery = (
  provider: IVMwareProvider | null
): QueryResult<IVMwareDatastore[]> => {
  const result = useMockableQuery<IVMwareDatastore[]>(
    {
      queryKey: `datastores:${provider?.name}`,
      queryFn: () =>
        fetch(getApiUrl(`${provider?.selfLink || ''}/datastores?detail=true`)).then((res) =>
          res.json()
        ),
      config: {
        enabled: !!provider,
        refetchInterval: usePollingContext().isPollingEnabled ? POLLING_INTERVAL : false,
      },
    },
    MOCK_VMWARE_DATASTORES
  );
  return sortResultsByName(result);
};
