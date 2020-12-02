import { IStorageMapping, INetworkMapping } from '../types/mappings.types';
import { MOCK_STORAGE_CLASSES_BY_PROVIDER } from './storageClasses.mock';
import { MOCK_PROVIDERS } from './providers.mock';
import { MOCK_OPENSHIFT_NETWORKS, MOCK_VMWARE_NETWORKS } from './networks.mock';
import { MOCK_VMWARE_DATASTORES } from './datastores.mock';
import { nameAndNamespace } from '../helpers';
import { CLUSTER_API_VERSION, META } from '@app/common/constants';

export let MOCK_NETWORK_MAPPINGS: INetworkMapping[] = [];
export let MOCK_STORAGE_MAPPINGS: IStorageMapping[] = [];

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  const storageMapping1: IStorageMapping = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'StorageMap',
    metadata: {
      name: 'vcenter1-datastore-to-ocpv-storageclass1',
      namespace: META.namespace,
    },
    spec: {
      provider: {
        source: nameAndNamespace(MOCK_PROVIDERS.vsphere[0]),
        destination: nameAndNamespace(MOCK_PROVIDERS.openshift[0]),
      },
      map: [
        {
          source: {
            id: MOCK_VMWARE_DATASTORES[0].id,
          },
          destination: {
            storageClass: MOCK_STORAGE_CLASSES_BY_PROVIDER['ocpv-1'][0].name,
          },
        },
      ],
    },
  };

  const storageMapping2: IStorageMapping = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'StorageMap',
    metadata: {
      name: 'vcenter1-datastore-to-ocpv-storageclass1',
      namespace: META.namespace,
    },
    spec: {
      provider: {
        source: nameAndNamespace(MOCK_PROVIDERS.vsphere[0]),
        destination: nameAndNamespace(MOCK_PROVIDERS.openshift[0]),
      },
      map: [
        {
          source: {
            id: MOCK_VMWARE_DATASTORES[1].id,
          },
          destination: {
            storageClass: MOCK_STORAGE_CLASSES_BY_PROVIDER['ocpv-1'][1].name,
          },
        },
      ],
    },
  };

  MOCK_STORAGE_MAPPINGS = [storageMapping1, storageMapping2];

  const networkMapping1: INetworkMapping = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'NetworkMap',
    metadata: {
      name: 'vcenter1-netstore-to-ocp1-network1',
      namespace: META.namespace,
    },
    spec: {
      provider: {
        source: nameAndNamespace(MOCK_PROVIDERS.vsphere[0]),
        destination: nameAndNamespace(MOCK_PROVIDERS.openshift[0]),
      },
      map: [
        {
          source: {
            id: MOCK_VMWARE_NETWORKS[0].id,
          },
          destination: {
            ...nameAndNamespace(MOCK_OPENSHIFT_NETWORKS[0]),
            type: 'multus',
          },
        },
      ],
    },
  };

  const networkMapping2: INetworkMapping = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'NetworkMap',
    metadata: {
      name: 'vcenter1-netstore-to-ocp1-network2',
      namespace: META.namespace,
    },
    spec: {
      provider: {
        source: nameAndNamespace(MOCK_PROVIDERS.vsphere[0]),
        destination: nameAndNamespace(MOCK_PROVIDERS.openshift[0]),
      },
      map: [
        {
          source: {
            id: MOCK_VMWARE_NETWORKS[1].id,
          },
          destination: {
            ...nameAndNamespace(MOCK_OPENSHIFT_NETWORKS[1]),
            type: 'multus',
          },
        },
      ],
    },
  };

  const networkMapping3: INetworkMapping = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'StorageMap',
    metadata: {
      name: 'vcenter1-netstore-to-pod',
      namespace: META.namespace,
    },
    spec: {
      provider: {
        source: nameAndNamespace(MOCK_PROVIDERS.vsphere[0]),
        destination: nameAndNamespace(MOCK_PROVIDERS.openshift[0]),
      },
      map: [
        {
          source: {
            id: MOCK_VMWARE_NETWORKS[1].id,
          },
          destination: {
            type: 'pod',
          },
        },
      ],
    },
  };

  MOCK_NETWORK_MAPPINGS = [networkMapping1, networkMapping2, networkMapping3];
}
