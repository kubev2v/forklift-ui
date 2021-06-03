import { usePollingContext } from '@app/common/context';
import { QueryResult } from 'react-query';
import { getInventoryApiUrl, useResultsSortedByName, useMockableQuery } from './helpers';
import { MOCK_VMWARE_DATASTORES } from './mocks/datastores.mock';
import { IVMwareDatastore, IVMwareProvider, MappingType } from './types';
import { useAuthorizedFetch } from './fetchHelpers';

export const useDatastoresQuery = (
  provider: IVMwareProvider | null,
  mappingType: MappingType
): QueryResult<IVMwareDatastore[]> => {
  const result = useMockableQuery<IVMwareDatastore[]>(
    {
      queryKey: ['datastores', provider?.name],
      queryFn: useAuthorizedFetch(
        getInventoryApiUrl(`${provider?.selfLink || ''}/datastores?detail=1`)
      ),
      config: {
        enabled: !!provider && mappingType === MappingType.Storage,
        refetchInterval: usePollingContext().refetchInterval,
      },
    },
    MOCK_VMWARE_DATASTORES
  );
  return useResultsSortedByName(result);
};
