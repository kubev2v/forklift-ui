import { UseQueryResult } from 'react-query';
import { usePollingContext } from '@app/common/context';
import { useAuthorizedFetch } from './fetchHelpers';
import { useMockableQuery, getInventoryApiUrl, sortByName } from './helpers';
import { MOCK_RHV_VMS, MOCK_VMWARE_VMS } from './mocks/vms.mock';
import { SourceInventoryProvider } from './types';
import { SourceVM, IVMwareVM } from './types/vms.types';

export const useSourceVMsQuery = (
  provider: SourceInventoryProvider | null
): UseQueryResult<SourceVM[]> => {
  let mockVMs: SourceVM[] = [];
  if (provider?.type === 'vsphere') mockVMs = MOCK_VMWARE_VMS;
  if (provider?.type === 'ovirt') mockVMs = MOCK_RHV_VMS;
  const result = useMockableQuery<SourceVM[]>(
    {
      queryKey: ['vms', provider?.name],
      queryFn: useAuthorizedFetch(getInventoryApiUrl(`${provider?.selfLink || ''}/vms?detail=1`)),
      enabled: !!provider,
      refetchInterval: usePollingContext().refetchInterval,
      select: (vms: SourceVM[]) => {
        return sortByName(vms.filter((vm) => !(vm as IVMwareVM).isTemplate));
      },
    },
    mockVMs
  );

  return result;
};

export const findVMById = (id: string, vmsQuery: UseQueryResult<SourceVM[]>): SourceVM | null =>
  vmsQuery.data?.find((vm) => vm.id === id) || null;
