import * as React from 'react';
import { usePollingContext } from '@app/common/context';
import { UseQueryResult } from 'react-query';
import { useAuthorizedFetch } from './fetchHelpers';
import { useMockableQuery, getInventoryApiUrl, sortByName } from './helpers';
import { MOCK_RHV_VMS, MOCK_VMWARE_VMS } from './mocks/vms.mock';
import { SourceInventoryProvider } from './types';
import { SourceVM, IVMwareVM } from './types/vms.types';

type SourceVMsRecord = Record<string, SourceVM | undefined>;

export interface IndexedSourceVMs {
  vms: SourceVM[];
  vmsById: SourceVMsRecord;
  vmsByName: SourceVMsRecord;
  vmsBySelfLink: SourceVMsRecord;
  findVMsByIds: (ids: string[]) => SourceVM[];
  findVMsByNames: (names: string[]) => SourceVM[];
  findVMsBySelfLinks: (selfLinks: string[]) => SourceVM[];
}

const findVMsInRecord = (record: SourceVMsRecord, keys: string[]) =>
  keys.flatMap((key) => (record[key] ? [record[key]] : [])) as SourceVM[];

export const indexVMs = (vms: SourceVM[]): IndexedSourceVMs => {
  const sortedVMs = sortByName(vms.filter((vm) => !(vm as IVMwareVM).isTemplate));
  const vmsById: SourceVMsRecord = {};
  const vmsByName: SourceVMsRecord = {};
  const vmsBySelfLink: SourceVMsRecord = {};
  sortedVMs.forEach((vm) => {
    vmsById[vm.id] = vm;
    vmsByName[vm.name] = vm;
    vmsBySelfLink[vm.selfLink] = vm;
  });
  return {
    vms: sortedVMs,
    vmsById,
    vmsByName,
    vmsBySelfLink,
    findVMsByIds: (ids) => findVMsInRecord(vmsById, ids),
    findVMsByNames: (names) => findVMsInRecord(vmsByName, names),
    findVMsBySelfLinks: (selfLinks) => findVMsInRecord(vmsBySelfLink, selfLinks),
  };
};

export const useSourceVMsQuery = (
  provider: SourceInventoryProvider | null
): UseQueryResult<IndexedSourceVMs> => {
  const indexVmsCallback = React.useCallback((data) => indexVMs(data), []);
  let mockVMs: SourceVM[] = [];
  if (provider?.type === 'vsphere') mockVMs = MOCK_VMWARE_VMS;
  if (provider?.type === 'ovirt') mockVMs = MOCK_RHV_VMS;
  return useMockableQuery<SourceVM[], unknown, IndexedSourceVMs>(
    {
      queryKey: ['vms', provider?.name],
      queryFn: useAuthorizedFetch(getInventoryApiUrl(`${provider?.selfLink || ''}/vms?detail=1`)),
      enabled: !!provider,
      refetchInterval: usePollingContext().refetchInterval,
      select: indexVmsCallback,
    },
    mockVMs
  );
};
