import { IStorageMapping, INetworkMapping, MappingType } from '../types/mappings.types';
import { MOCK_STORAGE_CLASSES_BY_PROVIDER } from './storageClasses.mock';
import { MOCK_PROVIDERS } from './providers.mock';
import { MOCK_OPENSHIFT_NETWORKS, MOCK_VMWARE_NETWORKS } from './networks.mock';
import { MOCK_VMWARE_DATASTORES } from './datastores.mock';

export let MOCK_NETWORK_MAPPINGS: INetworkMapping[] = [];

// TODO put this condition back when we don't directly import mocks into components anymore
// if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
const storageMapping1: IStorageMapping = {
  type: MappingType.Storage,
  name: 'vcenter1_datastore_to_OCPv_storageclass1',
  provider: {
    source: MOCK_PROVIDERS.vsphere[0],
    target: MOCK_PROVIDERS.openshift[0],
  },
  items: [
    {
      source: {
        id: MOCK_VMWARE_DATASTORES[0].id,
      },
      target: MOCK_STORAGE_CLASSES_BY_PROVIDER.OCPv_1[0],
    },
  ],
};

const storageMapping2: IStorageMapping = {
  type: MappingType.Storage,
  name: 'vcenter1_datastore_to_OCPv_storageclass2',
  provider: {
    source: MOCK_PROVIDERS.vsphere[0],
    target: MOCK_PROVIDERS.openshift[0],
  },
  items: [
    {
      source: {
        id: MOCK_VMWARE_DATASTORES[1].id,
      },
      target: MOCK_STORAGE_CLASSES_BY_PROVIDER.OCPv_1[1],
    },
  ],
};

export const MOCK_STORAGE_MAPPINGS: IStorageMapping[] = [storageMapping1, storageMapping2];

const networkMapping1: INetworkMapping = {
  type: MappingType.Network,
  name: 'vcenter1_netstore_to_OCP1_network1',
  provider: {
    source: MOCK_PROVIDERS.vsphere[0],
    target: MOCK_PROVIDERS.openshift[0],
  },
  items: [
    {
      source: {
        id: MOCK_VMWARE_NETWORKS[0].id,
      },
      target: MOCK_OPENSHIFT_NETWORKS[0],
    },
  ],
};

const networkMapping2: INetworkMapping = {
  type: MappingType.Network,
  name: 'vcenter1_netstore_to_OCP1_network2',
  provider: {
    source: MOCK_PROVIDERS.vsphere[0],
    target: MOCK_PROVIDERS.openshift[0],
  },
  items: [
    {
      source: {
        id: MOCK_VMWARE_NETWORKS[1].id,
      },
      target: MOCK_OPENSHIFT_NETWORKS[1],
    },
  ],
};

MOCK_NETWORK_MAPPINGS = [networkMapping1, networkMapping2];
// }
