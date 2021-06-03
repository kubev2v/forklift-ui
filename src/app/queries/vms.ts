import * as React from 'react';
import { QueryResult } from 'react-query';
import { usePollingContext } from '@app/common/context';
import { useAuthorizedFetch } from './fetchHelpers';
import { useMockableQuery, getInventoryApiUrl, sortByName } from './helpers';
import { MOCK_VMWARE_VMS } from './mocks/vms.mock';
import { IVMwareProvider } from './types';
import { IVMwareVM } from './types/vms.types';

export const useVMwareVMsQuery = (provider: IVMwareProvider | null): QueryResult<IVMwareVM[]> => {
  const result = useMockableQuery<IVMwareVM[]>(
    {
      queryKey: ['vms', provider?.name],
      queryFn: useAuthorizedFetch(getInventoryApiUrl(`${provider?.selfLink || ''}/vms?detail=1`)),
      config: {
        enabled: !!provider,
        refetchInterval: usePollingContext().refetchInterval,
      },
    },
    MOCK_VMWARE_VMS
  );
  const sortedData = React.useMemo(
    () => sortByName((result.data || []).filter((vm) => !vm.isTemplate)),
    [result.data]
  );
  return {
    ...result,
    data: result.data ? sortedData : undefined,
  };
};

export const findVMById = (id: string, vmsQuery: QueryResult<IVMwareVM[]>): IVMwareVM | null =>
  vmsQuery.data?.find((vm) => vm.id === id) || null;
