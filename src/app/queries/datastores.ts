import { usePollingContext } from '@app/common/context';
import { QueryResult } from 'react-query';
import { POLLING_INTERVAL } from './constants';
import { getApiUrl, sortResultsByName, useMockableQuery } from './helpers';
import { MOCK_VMWARE_DATASTORES } from './mocks/datastores.mock';
import { IVMwareDatastore, IVMwareProvider, MappingType } from './types';
import { useAuthorizedFetch } from './fetchHelpers';

export const useDatastoresQuery = (
  provider: IVMwareProvider | null,
  mappingType: MappingType
): QueryResult<IVMwareDatastore[]> => {
  const result = useMockableQuery<IVMwareDatastore[]>(
    {
      queryKey: `datastores:${provider?.name}`,
      queryFn: useAuthorizedFetch(getApiUrl(`${provider?.selfLink || ''}/datastores?detail=true`)),
      config: {
        enabled: !!provider && mappingType === MappingType.Storage,
        refetchInterval: usePollingContext().isPollingEnabled ? POLLING_INTERVAL : false,
      },
    },
    MOCK_VMWARE_DATASTORES
  );
  return sortResultsByName(result);
};
