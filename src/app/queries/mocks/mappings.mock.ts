import { IStorageMapping, INetworkMapping } from '../types/mappings.types';
import { MOCK_STORAGE_CLASSES_BY_PROVIDER } from './storageClasses.mock';
import { MOCK_PROVIDERS } from './providers.mock';
import { MOCK_OPENSHIFT_NETWORKS, MOCK_VMWARE_NETWORKS } from './networks.mock';
import { MOCK_VMWARE_DATASTORES } from './datastores.mock';
import { nameAndNamespace } from '../helpers';
import { VIRT_META } from '@app/common/constants';

export let MOCK_NETWORK_MAPPINGS: INetworkMapping[] = [];
export let MOCK_STORAGE_MAPPINGS: IStorageMapping[] = [];

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  const storageMapping1: IStorageMapping = {
    metadata: {
      name: 'vcenter1_datastore_to_OCPv_storageclass1',
      namespace: VIRT_META.namespace,
    },
    provider: {
      source: nameAndNamespace(MOCK_PROVIDERS.vsphere[0]),
      destination: nameAndNamespace(MOCK_PROVIDERS.openshift[0]),
    },
    datastores: [
      {
        source: {
          id: MOCK_VMWARE_DATASTORES[0].id,
        },
        destination: {
          storageClass: MOCK_STORAGE_CLASSES_BY_PROVIDER.OCPv_1[0].name,
        },
      },
    ],
  };

  const storageMapping2: IStorageMapping = {
    metadata: {
      name: 'vcenter1_datastore_to_OCPv_storageclass2',
      namespace: VIRT_META.namespace,
    },
    provider: {
      source: nameAndNamespace(MOCK_PROVIDERS.vsphere[0]),
      destination: nameAndNamespace(MOCK_PROVIDERS.openshift[0]),
    },
    datastores: [
      {
        source: {
          id: MOCK_VMWARE_DATASTORES[1].id,
        },
        destination: {
          storageClass: MOCK_STORAGE_CLASSES_BY_PROVIDER.OCPv_1[1].name,
        },
      },
    ],
  };

  MOCK_STORAGE_MAPPINGS = [storageMapping1, storageMapping2];

  const networkMapping1: INetworkMapping = {
    metadata: {
      name: 'vcenter1_netstore_to_OCP1_network1',
      namespace: VIRT_META.namespace,
    },
    provider: {
      source: nameAndNamespace(MOCK_PROVIDERS.vsphere[0]),
      destination: nameAndNamespace(MOCK_PROVIDERS.openshift[0]),
    },
    networks: [
      {
        source: {
          id: MOCK_VMWARE_NETWORKS[0].id,
        },
        destination: {
          ...nameAndNamespace(MOCK_OPENSHIFT_NETWORKS[0]),
          type: 'pod',
        },
      },
    ],
  };

  const networkMapping2: INetworkMapping = {
    metadata: {
      name: 'vcenter1_netstore_to_OCP1_network2',
      namespace: VIRT_META.namespace,
    },
    provider: {
      source: nameAndNamespace(MOCK_PROVIDERS.vsphere[0]),
      destination: nameAndNamespace(MOCK_PROVIDERS.openshift[0]),
    },
    networks: [
      {
        source: {
          id: MOCK_VMWARE_NETWORKS[1].id,
        },
        destination: {
          ...nameAndNamespace(MOCK_OPENSHIFT_NETWORKS[1]),
          type: 'pod',
        },
      },
    ],
  };

  MOCK_NETWORK_MAPPINGS = [networkMapping1, networkMapping2];
}
