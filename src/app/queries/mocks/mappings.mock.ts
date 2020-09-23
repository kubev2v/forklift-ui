import { IStorageMapping, INetworkMapping, MappingType } from '../types/mappings.types';
import { MappingSource, MappingTarget } from '../types/mappings.types';
import { NetworkType } from '../types/providers.types';
import { MOCK_STORAGE_CLASSES_BY_PROVIDER } from './storageClasses.mock';
import { MOCK_PROVIDERS } from './providers.mock';

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
        id: 'id1',
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
        id: 'id2',
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
    source: MOCK_PROVIDERS.vsphere[0],
    target: MOCK_PROVIDERS.openshift[0],
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
