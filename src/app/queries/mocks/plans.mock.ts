import { IPlan, IPlanVM, IVMStatus } from '../types';
import { MOCK_INVENTORY_PROVIDERS } from '@app/queries/mocks/providers.mock';
import { CLUSTER_API_VERSION } from '@app/common/constants';
import { nameAndNamespace } from '../helpers';
import { MOCK_NETWORK_MAPPINGS, MOCK_STORAGE_MAPPINGS } from './mappings.mock';
import { MOCK_OPENSHIFT_NAMESPACES } from './namespaces.mock';

export let MOCK_PLANS: IPlan[];

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  const vm1: IPlanVM = {
    id: 'vm-1630',
  };

  const vm2: IPlanVM = {
    id: 'vm-2844',
  };

  const vm3: IPlanVM = {
    id: 'vm-1008',
  };

  const vm4: IPlanVM = {
    id: 'vm-2685',
  };

  const vmStatus1: IVMStatus = {
    id: vm1.id,
    pipeline: [
      {
        name: 'PreHook',
        description: 'Pre hook',
        progress: { total: 2, completed: 2 },
        phase: 'Mock Step Phase',
        started: '2020-10-10T14:04:10Z',
        completed: '2020-10-10T14:21:10Z',
      },
      {
        name: 'DiskTransfer',
        description: 'Transfer disks.',
        progress: { total: 1024 * 64, completed: 1024 * 30 },
        phase: 'Mock Step Phase',
        annotations: { unit: 'MB' },
        started: '2020-10-10T14:21:10Z',
        completed: '2020-10-10T15:57:10Z',
      },
      {
        name: 'ImageConversion',
        description: 'Convert image to kubevirt.',
        progress: { total: 2, completed: 0 },
        phase: 'Mock Step Phase',
        started: '2020-10-10T15:57:10Z',
      },
      {
        name: 'PostHook',
        description: 'Post hook',
        progress: { total: 2, completed: 0 },
        phase: 'Mock Step Phase',
      },
    ],
    phase: 'Mock VM Phase',
    started: '2020-10-10T14:04:10Z',
  };

  const vmStatus2: IVMStatus = {
    id: vm2.id,
    pipeline: [
      {
        name: 'PreHook',
        description: 'Pre hook',
        progress: { total: 1, completed: 1 },
        phase: 'Mock Step Phase',
        started: '2020-10-10T14:04:10Z',
        completed: '2020-10-10T14:21:10Z',
      },
      {
        name: 'DiskTransfer',
        description: 'Transfer disks.',
        progress: { total: 1024 * 64, completed: 1024 * 64 },
        phase: 'Mock Step Phase',
        annotations: { unit: 'MB' },
        started: '2020-10-10T14:21:10Z',
        completed: '2020-10-10T15:57:10Z',
      },
      {
        name: 'ImageConversion',
        description: 'Convert image to kubevirt.',
        progress: { total: 1, completed: 0 },
        phase: 'Mock Step Phase',
        started: '2020-10-10T15:57:10Z',
      },
      {
        name: 'PostHook',
        description: 'Pre hook',
        progress: { total: 1, completed: 0 },
        phase: 'Mock Step Phase',
      },
    ],
    phase: 'Mock VM Phase',
    started: '2020-10-10T14:04:10Z',
  };

  const vmStatus3: IVMStatus = {
    id: vm3.id,
    pipeline: [
      {
        name: 'PreHook',
        description: 'Pre hook',
        progress: { total: 2, completed: 2 },
        phase: 'Latest message from controller',
        started: '2020-10-10T14:04:10Z',
        completed: '2020-10-10T14:21:10Z',
      },
      {
        name: 'DiskTransfer',
        description: 'Transfer disks.',
        progress: { total: 1024 * 64, completed: 1024 * 64 },
        phase: 'Mock Step Phase',
        annotations: { unit: 'MB' },
        started: '2020-10-10T14:21:10Z',
        completed: '2020-10-10T15:57:10Z',
      },
      {
        name: 'ImageConversion',
        description: 'Convert image to kubevirt.',
        progress: { total: 3, completed: 3 },
        phase: 'Mock Step Phase',
        started: '2020-10-10T15:57:10Z',
        completed: '2020-10-10T15:58:43Z',
      },
    ],
    phase: 'Mock VM Phase',
    started: '2020-10-10T14:04:10Z',
    completed: '2020-10-10T15:58:43Z',
  };

  const vmStatus4: IVMStatus = {
    id: vm4.id,
    pipeline: [
      {
        name: 'PreHook',
        description: 'Pre Hook',
        progress: { total: 2, completed: 2 },
        phase: 'Latest message from controller',
        started: '2020-10-10T14:04:10Z',
        completed: '2020-10-10T14:21:10Z',
      },
      {
        name: 'DiskTransfer',
        description: 'Transfer disks.',
        progress: { total: 1024 * 64, completed: 1024 * 64 },
        phase: 'Mock Step Phase',
        annotations: { unit: 'MB' },
        started: '2020-10-10T14:21:10Z',
        completed: '2020-10-10T15:57:10Z',
      },
      {
        name: 'ImageConversion',
        description: 'Convert image to kubevirt.',
        progress: { total: 3, completed: 1 },
        phase: 'Mock Step Phase',
        started: '2020-10-10T15:57:10Z',
        error: {
          phase: 'ImportCreated',
          reasons: [
            'Failed to initialize the source provider (Failed to connect to source provider): Post https://172.31.2.12/sdk: context deadline exceeded',
          ],
        },
      },
      {
        name: 'PostHook',
        description: 'Post Hook',
        progress: { total: 1, completed: 0 },
        phase: 'Mock Step Phase',
      },
    ],
    phase: 'Mock VM Phase',
    started: '2020-10-10T14:04:10Z',
    completed: '',
    error: {
      phase: 'ImageConversion',
      reasons: [
        'Failed to initialize the source provider (Failed to connect to source provider): Post https://172.31.2.12/sdk: context deadline exceeded',
      ],
    },
  };

  const plan1: IPlan = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Plan',
    metadata: {
      name: 'plantest-1',
      namespace: 'openshift-migration',
      generation: 2,
      resourceVersion: '30825024',
      selfLink:
        '/apis/forklift.konveyor.io/v1alpha1/namespaces/openshift-migration/plans/plantest-1',
      uid: '28fde094-b667-4d21-8f29-27c18f22178c',
      creationTimestamp: '2020-08-27T19:40:49Z',
    },
    spec: {
      description: 'my first plan',
      provider: {
        source: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.vsphere[0]),
        destination: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
      },
      targetNamespace: MOCK_OPENSHIFT_NAMESPACES[0].name,
      map: {
        networks: MOCK_NETWORK_MAPPINGS[0].spec.map,
        datastores: MOCK_STORAGE_MAPPINGS[0].spec.map,
      },
      vms: [vm1, vm2],
    },
    status: {
      conditions: [
        {
          category: 'Critical',
          lastTransitionTime: '2020-09-18T16:04:10Z',
          message: 'The destination provider is not valid.',
          reason: 'TypeNotValid',
          status: true,
          type: 'DestinationProviderNotValid',
        },
        {
          category: 'Critical',
          lastTransitionTime: '2020-09-18T16:04:10Z',
          message: 'Source network not valid.',
          reason: 'NotFound',
          status: true,
          type: 'SourceNetworkNotValid',
        },
        {
          category: 'Info',
          lastTransitionTime: '2020-09-18T16:04:10Z',
          message: 'In progress',
          reason: 'Valid',
          status: true,
          type: 'Executing',
        },
      ],
      observedGeneration: 2,
      migration: {
        active: '',
        started: '2020-10-10T14:04:10Z',
        vms: [vmStatus1, vmStatus2],
      },
    },
  };

  const plan2: IPlan = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Plan',
    metadata: {
      name: 'plantest-2',
      namespace: 'openshift-migration',
      generation: 2,
      resourceVersion: '30825024',
      selfLink:
        '/apis/forklift.konveyor.io/v1alpha1/namespaces/openshift-migration/plans/plantest-2',
      uid: '28fde094-b667-4d21-8f29-27c18f22178c',
      creationTimestamp: '2020-08-27T19:40:49Z',
    },
    spec: {
      description: 'my 2nd plan',
      provider: {
        source: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.vsphere[0]),
        destination: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
      },
      targetNamespace: MOCK_OPENSHIFT_NAMESPACES[0].name,
      map: {
        networks: MOCK_NETWORK_MAPPINGS[0].spec.map,
        datastores: MOCK_STORAGE_MAPPINGS[0].spec.map,
      },
      vms: [vm1],
    },
    status: {
      conditions: [
        {
          category: 'Info',
          lastTransitionTime: '2020-09-18T16:04:10Z',
          message: 'Ready for migration',
          reason: 'Valid',
          status: true,
          type: 'Ready',
        },
      ],
      observedGeneration: 2,
    },
  };

  const plan3: IPlan = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Plan',
    metadata: {
      name: 'plantest-3',
      namespace: 'openshift-migration',
      generation: 2,
      resourceVersion: '30825023',
      selfLink:
        '/apis/forklift.konveyor.io/v1alpha1/namespaces/openshift-migration/plans/plantest-3',
      uid: '28fde094-b667-4d21-8f29-27c18f22178c',
      creationTimestamp: '2020-08-27T19:40:49Z',
    },
    spec: {
      description: 'my 3nd plan',
      provider: {
        source: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.vsphere[0]),
        destination: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
      },
      targetNamespace: MOCK_OPENSHIFT_NAMESPACES[0].name,
      map: {
        networks: MOCK_NETWORK_MAPPINGS[0].spec.map,
        datastores: MOCK_STORAGE_MAPPINGS[0].spec.map,
      },
      vms: [vm1, vm2, vm3, vm4],
    },
    status: {
      conditions: [
        {
          category: 'Info',
          lastTransitionTime: '2020-09-10T16:04:10Z',
          message: 'Ready for migration',
          reason: 'Valid',
          status: true,
          type: 'Failed',
        },
      ],
      observedGeneration: 2,
      migration: {
        active: '',
        started: '2020-10-10T14:04:10Z',
        vms: [vmStatus1, vmStatus2, vmStatus3, vmStatus4],
      },
    },
  };

  const plan4: IPlan = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Plan',
    metadata: {
      name: 'plantest-4',
      namespace: 'openshift-migration',
      generation: 2,
      resourceVersion: '30825024',
      selfLink:
        '/apis/forklift.konveyor.io/v1alpha1/namespaces/openshift-migration/plans/plantest-4',
      uid: '28fde094-b667-4d21-8f29-27c18f22178c',
      creationTimestamp: '2020-08-27T19:40:49Z',
    },
    spec: {
      description: 'my 4th plan',
      provider: {
        source: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.vsphere[0]),
        destination: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
      },
      targetNamespace: MOCK_OPENSHIFT_NAMESPACES[0].name,
      map: {
        networks: MOCK_NETWORK_MAPPINGS[0].spec.map,
        datastores: MOCK_STORAGE_MAPPINGS[0].spec.map,
      },
      vms: [vm3],
    },
    status: {
      conditions: [
        {
          category: 'Info',
          lastTransitionTime: '2020-09-10T16:04:10Z',
          message: 'Ready for migration',
          reason: 'Valid',
          status: true,
          type: 'Succeeded',
        },
      ],
      observedGeneration: 2,
      migration: {
        active: '',
        started: '2020-10-10T14:04:10Z',
        completed: '2020-10-10T15:58:43Z',
        vms: [vmStatus3],
      },
    },
  };

  const vmStatus1WithError = {
    ...vmStatus1,
    pipeline: [
      vmStatus1.pipeline[0],
      {
        ...vmStatus1.pipeline[1],
        error: {
          phase: 'DiskTransferFailed',
          reasons: ['Error transferring disks'],
        },
      },
      { ...vmStatus1.pipeline[2], started: undefined },
      vmStatus1.pipeline[3],
    ],
    error: {
      phase: 'DiskTransfer',
      reasons: ['Error transferring disks'],
    },
  };

  const vmStatus2WithError = {
    ...vmStatus1,
    pipeline: [
      vmStatus1.pipeline[0],
      vmStatus1.pipeline[1],
      {
        ...vmStatus1.pipeline[2],
        completed: '2020-10-10T15:58:10Z',
        error: {
          phase: 'ImageConversionFailed',
          reasons: ['Error converting image'],
        },
      },
      vmStatus1.pipeline[3],
    ],
    error: {
      phase: 'ImageConversion',
      reasons: ['Error converting image'],
    },
  };

  const plan5: IPlan = {
    ...plan1,
    metadata: { ...plan1.metadata, name: 'plantest-5' },
    spec: { ...plan1.spec, description: 'completed with errors' },
    status: {
      conditions: [
        {
          category: 'Info',
          lastTransitionTime: '2020-09-10T16:04:10Z',
          message: 'Ready for migration',
          reason: 'Valid',
          status: true,
          type: 'Failed',
        },
      ],
      observedGeneration: 2,
      migration: {
        active: '',
        started: '2020-10-10T14:04:10Z',
        vms: [vmStatus1WithError, vmStatus2WithError],
      },
    },
  };

  MOCK_PLANS = [plan1, plan2, plan3, plan4, plan5];
}
