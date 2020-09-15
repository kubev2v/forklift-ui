import { IStorageMapping, INetworkMapping, MappingType } from '../../types';
import { ProviderType } from '@app/common/constants';
import { MappingSource, MappingTarget } from '@app/Mappings/types';
import { NetworkType } from '@app/Providers/types';

const storageMapping1: IStorageMapping = {
  type: MappingType.Storage,
  name: 'vcenter1_datastore_to_OCPv_storageclass1',
  provider: {
    source: {
      type: ProviderType.vsphere,
      name: 'vcenter1',
    },
    target: {
      type: ProviderType.cnv,
      name: 'ocp1',
    },
  },
  items: [
    {
      source: {
        id: 'id1',
      },
      target: 'storageclass1',
    },
  ],
};

const storageMapping2: IStorageMapping = {
  type: MappingType.Storage,
  name: 'vcenter1_datastore_to_OCPv_storageclass2',
  provider: {
    source: {
      type: ProviderType.vsphere,
      name: 'vcenter1',
    },
    target: {
      type: ProviderType.cnv,
      name: 'ocp1',
    },
  },
  items: [
    {
      source: {
        id: 'id2',
      },
      target: 'storageclass2',
    },
  ],
};

export const MOCK_STORAGE_MAPPINGS: IStorageMapping[] = [storageMapping1, storageMapping2];

export const MOCK_STORAGE_MAPPING_SOURCES: MappingSource[] = [
  { id: '1', name: 'vmware-datastore-1' },
  { id: '2', name: 'vmware-datastore-2' },
];

export const MOCK_STORAGE_MAPPING_TARGETS: MappingTarget[] = ['gold', 'silver', 'bronze'];

const networkMapping1: INetworkMapping = {
  type: MappingType.Network,
  name: 'vcenter1_netstore_to_OCP1_network1',
  provider: {
    source: {
      type: ProviderType.vsphere,
      name: 'vcenter1',
    },
    target: {
      type: ProviderType.cnv,
      name: 'ocp1',
    },
  },
  items: [
    {
      source: {
        id: 'id1',
      },
      target: {
        type: NetworkType.Pod,
        name: 'network1',
        namespace: 'namespace-test',
      },
    },
  ],
};

const networkMapping2: INetworkMapping = {
  type: MappingType.Network,
  name: 'vcenter1_netstore_to_OCP1_network2',
  provider: {
    source: {
      type: ProviderType.vsphere,
      name: 'vcenter1',
    },
    target: {
      type: ProviderType.cnv,
      name: 'ocp1',
    },
  },
  items: [
    {
      source: {
        id: 'id2',
      },
      target: {
        type: NetworkType.Pod,
        name: 'network2',
        namespace: 'namespace-test',
      },
    },
  ],
};
export const MOCK_NETWORK_MAPPINGS: INetworkMapping[] = [networkMapping1, networkMapping2];

export const MOCK_NETWORK_MAPPING_SOURCES: MappingSource[] = [
  { id: '1', name: 'vcenter1-netstore-1' },
  { id: '2', name: 'vcenter1-netstore-2' },
];

export const MOCK_NETWORK_MAPPING_TARGETS: MappingTarget[] = [
  {
    type: NetworkType.Pod,
    name: 'network1',
    namespace: 'namespace-test',
  },
  {
    type: NetworkType.Pod,
    name: 'network2',
    namespace: 'namespace-test',
  },
];
