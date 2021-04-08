import { IPlan, IPlanVM, IVMStatus } from '../types';
import { MOCK_INVENTORY_PROVIDERS } from '@app/queries/mocks/providers.mock';
import { CLUSTER_API_VERSION, META } from '@app/common/constants';
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
        name: 'DiskTransfer',
        description: 'Transfer disks.',
        progress: { total: 1024 * 64, completed: 1024 * 30 + 421 },
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
    ],
    phase: 'Mock VM Phase',
    started: '2020-10-10T14:04:10Z',
  };

  const vmStatus2: IVMStatus = {
    id: vm2.id,
    pipeline: [
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
    ],
    phase: 'Mock VM Phase',
    started: '2020-10-10T14:04:10Z',
  };

  const vmStatus3: IVMStatus = {
    id: vm3.id,
    pipeline: [
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
    conditions: [
      {
        category: 'Advisory',
        durable: true,
        lastTransitionTime: '2020-10-10T15:58:43Z',
        message: 'The VM migration has SUCCEEDED.',
        status: 'True',
        type: 'Succeeded',
      },
    ],
  };

  const vmStatus4: IVMStatus = {
    id: vm4.id,
    pipeline: [
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

  const vmStatusWithTopLevelError: IVMStatus = {
    id: vm2.id,
    pipeline: [
      {
        name: 'DiskTransfer',
        description: 'Transfer disks.',
        progress: { total: 1024 * 64, completed: 0 },
        annotations: { unit: 'MB' },
        started: '2020-10-10T14:21:10Z',
      },
      {
        name: 'ImageConversion',
        description: 'Convert image to kubevirt.',
        progress: { total: 1, completed: 0 },
        phase: 'Mock Step Phase',
      },
    ],
    phase: 'Mock VM Phase',
    started: '2020-10-10T14:04:10Z',
    completed: '2020-10-11T14:04:10Z',
    error: { phase: 'ImportCreated', reasons: ['Import CR not found.'] },
  };

  const plan1: IPlan = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Plan',
    metadata: {
      name: 'plantest-01',
      namespace: 'openshift-migration',
      generation: 2,
      resourceVersion: '30825024',
      selfLink:
        '/apis/forklift.konveyor.io/v1alpha1/namespaces/openshift-migration/plans/plantest-01',
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
        network: nameAndNamespace(MOCK_NETWORK_MAPPINGS[0].metadata),
        storage: nameAndNamespace(MOCK_STORAGE_MAPPINGS[0].metadata),
      },
      vms: [vm1, vm2],
      warm: false,
    },
    status: {
      conditions: [
        {
          category: 'Critical',
          lastTransitionTime: '2020-09-18T16:04:10Z',
          message: 'The destination provider is not valid.',
          reason: 'TypeNotValid',
          status: 'True',
          type: 'DestinationProviderNotValid',
        },
        {
          category: 'Critical',
          lastTransitionTime: '2020-09-18T16:04:10Z',
          message: 'Source network not valid.',
          reason: 'NotFound',
          status: 'True',
          type: 'SourceNetworkNotValid',
        },
        {
          category: 'Info',
          lastTransitionTime: '2020-09-18T16:04:10Z',
          message: 'In progress',
          reason: 'Valid',
          status: 'True',
          type: 'Executing',
        },
        {
          category: 'Info',
          lastTransitionTime: '2020-09-18T16:04:10Z',
          message: 'Ready for migration',
          reason: 'Valid',
          status: 'True',
          type: 'Ready',
        },
      ],
      observedGeneration: 2,
      migration: {
        active: '',
        started: '2020-10-10T14:04:10Z',
        vms: [vmStatus1, vmStatus2],
        history: [
          {
            conditions: [],
            migration: {
              name: 'plan-0-mock-migration',
              namespace: META.namespace,
            },
            plan: {
              name: 'plantest-01',
              namespace: 'openshift-migration',
            },
            provider: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
          },
        ],
      },
    },
  };

  const plan2: IPlan = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Plan',
    metadata: {
      name: 'plantest-02',
      namespace: 'openshift-migration',
      generation: 2,
      resourceVersion: '30825024',
      selfLink:
        '/apis/forklift.konveyor.io/v1alpha1/namespaces/openshift-migration/plans/plantest-02',
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
      transferNetwork: 'ocp-network-2',
      map: {
        network: nameAndNamespace(MOCK_NETWORK_MAPPINGS[0].metadata),
        storage: nameAndNamespace(MOCK_STORAGE_MAPPINGS[0].metadata),
      },
      vms: [vm1],
      warm: false,
    },
    status: {
      conditions: [
        {
          category: 'Info',
          lastTransitionTime: '2020-09-18T16:04:10Z',
          message: 'Ready for migration',
          reason: 'Valid',
          status: 'True',
          type: 'Ready',
        },
      ],
      observedGeneration: 2,
    },
  };

  const vmStatus1WithCancel: IVMStatus = {
    ...vmStatus1,
    pipeline: [
      vmStatus1.pipeline[0],
      { ...vmStatus1.pipeline[1], completed: '2020-10-10T17:34:10Z' },
    ],
    conditions: [
      {
        type: 'Canceled',
        category: 'Information',
        status: 'True',
        message: 'Canceled by user',
        lastTransitionTime: '2020-10-10T17:34:10Z',
      },
    ],
  };

  const plan3: IPlan = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Plan',
    metadata: {
      name: 'plantest-03',
      namespace: 'openshift-migration',
      generation: 2,
      resourceVersion: '30825023',
      selfLink:
        '/apis/forklift.konveyor.io/v1alpha1/namespaces/openshift-migration/plans/plantest-03',
      uid: '28fde094-b667-4d21-8f29-27c18f22178c',
      creationTimestamp: '2020-08-27T19:40:49Z',
    },
    spec: {
      description: 'my 3rd plan',
      provider: {
        source: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.vsphere[0]),
        destination: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
      },
      targetNamespace: MOCK_OPENSHIFT_NAMESPACES[0].name,
      map: {
        network: nameAndNamespace(MOCK_NETWORK_MAPPINGS[0].metadata),
        storage: nameAndNamespace(MOCK_STORAGE_MAPPINGS[0].metadata),
      },
      vms: [vm1, vm2, vm3, vm4],
      warm: false,
    },
    status: {
      conditions: [
        {
          category: 'Info',
          lastTransitionTime: '2020-09-10T16:04:10Z',
          message: 'Ready for migration',
          reason: 'Valid',
          status: 'True',
          type: 'Failed',
        },
        {
          category: 'Info',
          lastTransitionTime: '2020-09-18T16:04:10Z',
          message: 'Ready for migration',
          reason: 'Valid',
          status: 'True',
          type: 'Ready',
        },
      ],
      observedGeneration: 2,
      migration: {
        active: '',
        started: '2020-10-10T14:04:10Z',
        vms: [vmStatus1WithCancel, vmStatusWithTopLevelError, vmStatus3, vmStatus4],
        history: [
          {
            conditions: [],
            migration: {
              name: 'plan-2-mock-migration',
              namespace: META.namespace,
            },
            plan: {
              name: 'plantest-03',
              namespace: 'openshift-migration',
            },
            provider: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
          },
        ],
      },
    },
  };

  const plan4: IPlan = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Plan',
    metadata: {
      name: 'plantest-04',
      namespace: 'openshift-migration',
      generation: 2,
      resourceVersion: '30825024',
      selfLink:
        '/apis/forklift.konveyor.io/v1alpha1/namespaces/openshift-migration/plans/plantest-04',
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
        network: nameAndNamespace(MOCK_NETWORK_MAPPINGS[0].metadata),
        storage: nameAndNamespace(MOCK_STORAGE_MAPPINGS[0].metadata),
      },
      vms: [vm3],
      warm: false,
    },
    status: {
      conditions: [
        {
          category: 'Info',
          lastTransitionTime: '2020-09-10T16:04:10Z',
          message: 'Ready for migration',
          reason: 'Valid',
          status: 'True',
          type: 'Succeeded',
        },
        {
          category: 'Info',
          lastTransitionTime: '2020-09-18T16:04:10Z',
          message: 'Ready for migration',
          reason: 'Valid',
          status: 'True',
          type: 'Ready',
        },
      ],
      observedGeneration: 2,
      migration: {
        active: '',
        started: '2020-10-10T14:04:10Z',
        completed: '2020-10-10T15:58:43Z',
        vms: [vmStatus3],
        history: [
          {
            conditions: [],
            migration: {
              name: 'plan-3-mock-migration',
              namespace: META.namespace,
            },
            plan: {
              name: 'plantest-04',
              namespace: 'openshift-migration',
            },
            provider: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
          },
        ],
      },
    },
  };

  const vmStatus1WithError: IVMStatus = {
    ...vmStatus1,
    pipeline: [
      {
        ...vmStatus1.pipeline[0],
        error: {
          phase: 'DiskTransferFailed',
          reasons: ['Error transferring disks'],
        },
      },
      { ...vmStatus1.pipeline[1], started: undefined },
    ],
    error: {
      phase: 'DiskTransfer',
      reasons: ['Error transferring disks'],
    },
  };

  const vmStatus2WithError: IVMStatus = {
    ...vmStatus1,
    pipeline: [
      vmStatus1.pipeline[0],
      {
        ...vmStatus1.pipeline[1],
        completed: '2020-10-10T15:58:10Z',
        error: {
          phase: 'ImageConversionFailed',
          reasons: ['Error converting image'],
        },
      },
    ],
    error: {
      phase: 'ImageConversion',
      reasons: ['Error converting image'],
    },
  };

  const plan5: IPlan = {
    ...plan1,
    metadata: { ...plan1.metadata, name: 'plantest-05' },
    spec: { ...plan1.spec, description: 'completed with errors' },
    status: {
      conditions: [
        {
          category: 'Info',
          lastTransitionTime: '2020-09-10T16:04:10Z',
          message: 'Ready for migration',
          reason: 'Valid',
          status: 'True',
          type: 'Failed',
        },
        {
          category: 'Info',
          lastTransitionTime: '2020-09-18T16:04:10Z',
          message: 'Ready for migration',
          reason: 'Valid',
          status: 'True',
          type: 'Ready',
        },
      ],
      observedGeneration: 2,
      migration: {
        active: '',
        started: '2020-10-10T14:04:10Z',
        vms: [vmStatus1WithError, vmStatus2WithError],
        history: [
          {
            conditions: [],
            migration: {
              name: 'plan-4-mock-migration',
              namespace: META.namespace,
            },
            plan: {
              name: 'plantest-05',
              namespace: 'openshift-migration',
            },
            provider: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
          },
        ],
      },
    },
  };

  const plan6: IPlan = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Plan',
    metadata: {
      name: 'plantest-06',
      namespace: 'openshift-migration',
      generation: 2,
      resourceVersion: '30825024',
      selfLink:
        '/apis/forklift.konveyor.io/v1alpha1/namespaces/openshift-migration/plans/plantest-06',
      uid: '28fde094-b667-4d21-8f29-27c18f22178c',
      creationTimestamp: '2020-08-27T19:40:49Z',
    },
    spec: {
      description: 'newly created warm plan',
      provider: {
        source: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.vsphere[0]),
        destination: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[1]),
      },
      targetNamespace: MOCK_OPENSHIFT_NAMESPACES[0].name,
      map: {
        network: nameAndNamespace(MOCK_NETWORK_MAPPINGS[0].metadata),
        storage: nameAndNamespace(MOCK_STORAGE_MAPPINGS[0].metadata),
      },
      vms: [vm1],
      warm: true,
    },
    status: {
      conditions: [
        {
          category: 'Info',
          lastTransitionTime: '2020-09-18T16:04:10Z',
          message: 'Ready for migration',
          reason: 'Valid',
          status: 'True',
          type: 'Ready',
        },
      ],
      observedGeneration: 2,
    },
  };

  const warmVmPrecopying: IVMStatus = {
    ...vmStatus1,
    pipeline: vmStatus1.pipeline.map((step) => {
      // Remove started/completed/progress
      const { name, description, phase, annotations } = step;
      return {
        name,
        description,
        progress: { ...step.progress, completed: 0 },
        phase,
        annotations,
      };
    }),
    warm: {
      consecutiveFailures: 0,
      failures: 0,
      precopies: [
        {
          start: '2021-03-16T17:28:48Z',
        },
      ],
      successes: 0,
    },
  };

  const warmVmWithConsecutiveFailures: IVMStatus = {
    ...vmStatus2,
    pipeline: warmVmPrecopying.pipeline,
    warm: {
      consecutiveFailures: 2,
      failures: 0,
      precopies: [
        {
          start: '2021-03-16T17:28:48Z',
          end: '2021-03-16T17:29:42Z',
        },
        {
          start: '2021-03-16T18:29:20Z',
          end: '2021-03-16T18:30:38Z',
        },
        {
          start: '2021-03-16T18:30:38Z',
        },
      ],
      successes: 0,
    },
  };

  const warmVmPrecopyingWithError: IVMStatus = {
    ...warmVmPrecopying,
    completed: '2021-03-16T19:13:48Z',
    error: { phase: 'Mock Error', reasons: ['Something went wrong with a precopy?'] },
  };

  const warmVmIdle: IVMStatus = {
    ...vmStatus3,
    completed: undefined,
    pipeline: warmVmPrecopying.pipeline,
    warm: {
      consecutiveFailures: 0,
      failures: 0,
      nextPrecopyAt: '2021-03-16T18:29:20Z',
      precopies: [
        {
          start: '2021-03-16T17:28:48Z',
          end: '2021-03-16T17:29:42Z',
        },
        {
          start: '2021-03-16T18:29:20Z',
          end: '2021-03-16T18:30:38Z',
        },
        {
          start: '2021-03-16T18:30:38Z',
          end: '2021-03-16T18:31:48Z',
        },
      ],
      successes: 3,
    },
  };

  const warmVmCuttingOver1: IVMStatus = {
    ...vmStatus1,
    warm: warmVmIdle.warm,
  };

  const warmVmCuttingOver2: IVMStatus = {
    ...vmStatus2,
    warm: warmVmIdle.warm,
  };

  const warmVmCuttingOver3: IVMStatus = {
    ...vmStatus3,
    warm: warmVmIdle.warm,
  };

  const plan7: IPlan = {
    ...plan1,
    metadata: { ...plan1.metadata, name: 'plantest-07' },
    spec: {
      ...plan1.spec,
      description: 'various precopy states',
      warm: true,
      vms: [vm1, vm2, vm3],
    },
    status: {
      conditions: [
        {
          category: 'Info',
          lastTransitionTime: '2020-09-18T16:04:10Z',
          message: 'In progress',
          reason: 'Valid',
          status: 'True',
          type: 'Executing',
        },
        {
          category: 'Info',
          lastTransitionTime: '2020-09-18T16:04:10Z',
          message: 'Ready for migration',
          reason: 'Valid',
          status: 'True',
          type: 'Ready',
        },
      ],
      observedGeneration: 2,
      migration: {
        active: '',
        started: '2020-10-10T14:04:10Z',
        vms: [warmVmPrecopying, warmVmWithConsecutiveFailures, warmVmIdle],
        history: [
          {
            conditions: [],
            migration: {
              name: 'plan-6-mock-migration',
              namespace: META.namespace,
            },
            plan: {
              name: 'plantest-07',
              namespace: 'openshift-migration',
            },
            provider: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
          },
        ],
      },
    },
  };

  const plan8: IPlan = {
    ...plan1,
    metadata: { ...plan1.metadata, name: 'plantest-08' },
    spec: { ...plan7.spec, description: 'cutover started', vms: [vm1, vm2, vm3] },
    status: {
      conditions: plan7.status?.conditions || [],
      observedGeneration: 2,
      migration: {
        active: '',
        started: '2020-10-10T14:04:10Z',
        vms: [warmVmCuttingOver1, warmVmCuttingOver2, warmVmCuttingOver3],
        history: [
          {
            conditions: [],
            migration: {
              name: 'plan-7-mock-migration',
              namespace: META.namespace,
            },
            plan: {
              name: 'plantest-08',
              namespace: 'openshift-migration',
            },
            provider: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
          },
        ],
      },
    },
  };

  const plan9: IPlan = {
    ...plan1,
    metadata: { ...plan1.metadata, name: 'plantest-09' },
    spec: { ...plan7.spec, description: 'failed before cutover' },
    status: {
      conditions: [
        {
          category: 'Info',
          lastTransitionTime: '2020-10-10T15:04:10Z',
          message: 'Ready for migration',
          reason: 'Valid',
          status: 'True',
          type: 'Failed',
        },
        {
          category: 'Info',
          lastTransitionTime: '2020-09-18T16:04:10Z',
          message: 'Ready for migration',
          reason: 'Valid',
          status: 'True',
          type: 'Ready',
        },
      ],
      observedGeneration: 2,
      migration: {
        active: '',
        started: '2020-10-10T14:04:10Z',
        completed: '2020-10-10T15:04:10Z',
        vms: [warmVmPrecopyingWithError],
        history: [
          {
            conditions: [],
            migration: {
              name: 'plan-8-mock-migration',
              namespace: META.namespace,
            },
            plan: {
              name: 'plantest-09',
              namespace: 'openshift-migration',
            },
            provider: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
          },
        ],
      },
    },
  };

  const plan10: IPlan = {
    ...plan1,
    metadata: { ...plan1.metadata, name: 'plantest-10' },
    spec: { ...plan1.spec, description: 'finished with some canceled VMs' },
    status: {
      conditions: [
        {
          category: 'Info',
          lastTransitionTime: '2020-09-18T16:04:10Z',
          message: 'Ready for migration',
          reason: 'Valid',
          status: 'True',
          type: 'Ready',
        },
      ],
      observedGeneration: 2,
      migration: {
        active: '',
        started: '2020-10-10T14:04:10Z',
        completed: '2020-10-10T15:04:10Z',
        vms: [vmStatus1WithCancel, vmStatus3],
        history: [
          {
            conditions: [],
            migration: {
              name: 'plan-9-mock-migration',
              namespace: META.namespace,
            },
            plan: {
              name: 'plantest-10',
              namespace: 'openshift-migration',
            },
            provider: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
          },
        ],
      },
    },
  };

  MOCK_PLANS = [plan1, plan2, plan3, plan4, plan5, plan6, plan7, plan8, plan9, plan10];
}
