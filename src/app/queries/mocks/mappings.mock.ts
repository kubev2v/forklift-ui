import { IStorageMapping, INetworkMapping } from '../types/mappings.types';
import { MOCK_STORAGE_CLASSES_BY_PROVIDER } from './storageClasses.mock';
import { MOCK_INVENTORY_PROVIDERS } from './providers.mock';
import { MOCK_OPENSHIFT_NETWORKS, MOCK_VMWARE_NETWORKS } from './networks.mock';
import { MOCK_VMWARE_DATASTORES } from './datastores.mock';
import { nameAndNamespace } from '../helpers';
import { CLUSTER_API_VERSION, META } from '@app/common/constants';
import { getObjectRef } from '@app/common/helpers';
import { MOCK_PLANS } from './plans.mock';

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
        source: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.vsphere[0]),
        destination: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
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

  const storageMapping1WithOwner: IStorageMapping = {
    ...storageMapping1,
    metadata: {
      ...storageMapping1.metadata,
      name: 'plantest1-generated-asdf',
      ownerReferences: [getObjectRef(MOCK_PLANS[0])],
    },
  };

  const storageMapping2: IStorageMapping = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'StorageMap',
    metadata: {
      name: 'vcenter3-datastore-to-ocpv-storageclass2',
      namespace: META.namespace,
    },
    spec: {
      provider: {
        source: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.vsphere[2]),
        destination: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
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

  const invalidStorageMapping: IStorageMapping = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'StorageMap',
    metadata: {
      name: 'vcenter1-invalid-storage-mapping',
      namespace: META.namespace,
    },
    spec: {
      provider: {
        source: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.vsphere[2]),
        destination: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
      },
      map: [
        {
          source: {
            id: 'invalid-id',
          },
          destination: {
            storageClass: MOCK_STORAGE_CLASSES_BY_PROVIDER['ocpv-1'][1].name,
          },
        },
      ],
    },
  };

  MOCK_STORAGE_MAPPINGS = [
    storageMapping1,
    storageMapping1WithOwner,
    storageMapping2,
    invalidStorageMapping,
  ];

  const networkMapping1: INetworkMapping = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'NetworkMap',
    metadata: {
      name: 'vcenter1-netstore-to-ocp1-network1',
      namespace: META.namespace,
    },
    spec: {
      provider: {
        source: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.vsphere[0]),
        destination: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
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

  const networkMapping1WithOwner: INetworkMapping = {
    ...networkMapping1,
    metadata: {
      ...networkMapping1.metadata,
      name: 'plantest1-generated-zxcv',
      ownerReferences: [getObjectRef(MOCK_PLANS[0])],
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
        source: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.vsphere[0]),
        destination: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[1]),
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

  const invalidNetworkMapping: INetworkMapping = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'NetworkMap',
    metadata: {
      name: 'vcenter3-invalid-network-map',
      namespace: META.namespace,
    },
    spec: {
      provider: {
        source: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.vsphere[0]),
        destination: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
      },
      map: [
        {
          source: {
            id: MOCK_VMWARE_NETWORKS[1].id,
          },
          destination: {
            type: 'multus',
            name: 'missing-network',
            namespace: 'doesnt-matter',
          },
        },
      ],
    },
  };

  MOCK_NETWORK_MAPPINGS = [
    networkMapping1,
    networkMapping1WithOwner,
    networkMapping2,
    invalidNetworkMapping,
  ];
}
