import * as React from 'react';
import { QueryResult } from 'react-query';
import { usePollingContext } from '@app/common/context';
import { useAuthorizedFetch } from './fetchHelpers';
import { useMockableQuery, getInventoryApiUrl, sortByName } from './helpers';
import { MOCK_RHV_VMS, MOCK_VMWARE_VMS } from './mocks/vms.mock';
import { SourceInventoryProvider } from './types';
import { ISourceVM, IVMwareVM } from './types/vms.types';

export const useSourceVMsQuery = (
  provider: SourceInventoryProvider | null
): QueryResult<ISourceVM[]> => {
  let mockVMs: ISourceVM[] = [];
  if (provider?.type === 'vsphere') mockVMs = MOCK_VMWARE_VMS;
  if (provider?.type === 'ovirt') mockVMs = MOCK_RHV_VMS;
  const result = useMockableQuery<ISourceVM[]>(
    {
      queryKey: ['vms', provider?.name],
      queryFn: useAuthorizedFetch(getInventoryApiUrl(`${provider?.selfLink || ''}/vms?detail=1`)),
      config: {
        enabled: !!provider,
        refetchInterval: usePollingContext().refetchInterval,
      },
    },
    mockVMs
  );
  const sortedData = React.useMemo(
    () => sortByName((result.data || []).filter((vm) => !(vm as IVMwareVM).isTemplate)),
    [result.data]
  );
  return {
    ...result,
    data: result.data ? sortedData : undefined,
  };
};

export const findVMById = (id: string, vmsQuery: QueryResult<ISourceVM[]>): ISourceVM | null =>
  vmsQuery.data?.find((vm) => vm.id === id) || null;
