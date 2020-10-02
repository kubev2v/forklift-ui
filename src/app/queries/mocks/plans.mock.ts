import { IPlan, IMigration, IPlanVM, IVMStatus } from '../types';
import { MOCK_PROVIDERS } from '@app/queries/mocks/providers.mock';

// TODO put this condition back when we don't directly import mocks into components anymore
// if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
const vm1: IPlanVM = {
  id: 'vm1-id',
  hooks: {
    before: {
      type: 'string',
      image: 'string',
      envVars: 'string',
      targetVM: 'string',
      xtraVars: 'string',
    },
    after: {
      type: 'string',
      image: 'string',
      envVars: 'string',
      targetVM: 'string',
      xtraVars: 'string',
    },
  },
  host: {
    name: 'string',
    network: {
      name: 'string',
      address: 'string',
      isDefault: true,
    },
    bandwidth: 'string',
    mtu: 1400,
  },
};

const vm2: IPlanVM = {
  id: 'vm2-id',
  hooks: {
    before: {
      type: 'string',
      image: 'string',
      envVars: 'string',
      targetVM: 'string',
      xtraVars: 'string',
    },
    after: {
      type: 'string',
      image: 'string',
      envVars: 'string',
      targetVM: 'string',
      xtraVars: 'string',
    },
  },
  host: {
    name: 'string',
    network: {
      name: 'string',
      address: 'string',
      isDefault: true,
    },
    bandwidth: 'string',
    mtu: 1400,
  },
};

const plan1: IPlan = {
  apiVersion: 'virt.konveyor.io/v1alpha1',
  kind: 'Plan',
  metadata: {
    name: 'plantest-1',
    namespace: 'openshift-migration',
    generation: 2,
    resourceVersion: '30825024',
    selfLink: '/apis/virt.konveyor.io/v1alpha1/namespaces/openshift-migration/plans/plantest-1',
    uid: '28fde094-b667-4d21-8f29-27c18f22178c',
    creationTimestamp: '2020-08-27T19:40:49Z',
  },
  spec: {
    description: 'my first plan',
    provider: {
      sourceProvider: MOCK_PROVIDERS.vsphere[0],
      destinationProvider: MOCK_PROVIDERS.openshift[0],
    },
    map: {
      networks: [],
      datastores: [],
    },
    warm: false,
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
        type: 'Execute',
      },
    ],
    observedGeneration: 2,
  },
};

const plan2: IPlan = {
  apiVersion: 'virt.konveyor.io/v1alpha1',
  kind: 'Plan',
  metadata: {
    name: 'plantest-2',
    namespace: 'openshift-migration',
    generation: 2,
    resourceVersion: '30825024',
    selfLink: '/apis/virt.konveyor.io/v1alpha1/namespaces/openshift-migration/plans/plantest-2',
    uid: '28fde094-b667-4d21-8f29-27c18f22178c',
    creationTimestamp: '2020-08-27T19:40:49Z',
  },
  spec: {
    description: 'my 2nd plan',
    provider: {
      sourceProvider: MOCK_PROVIDERS.vsphere[0],
      destinationProvider: MOCK_PROVIDERS.openshift[0],
    },
    map: {
      networks: [],
      datastores: [],
    },
    warm: false,
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
  apiVersion: 'virt.konveyor.io/v1alpha1',
  kind: 'Plan',
  metadata: {
    name: 'plantest-3',
    namespace: 'openshift-migration',
    generation: 2,
    resourceVersion: '30825023',
    selfLink: '/apis/virt.konveyor.io/v1alpha1/namespaces/openshift-migration/plans/plantest-3',
    uid: '28fde094-b667-4d21-8f29-27c18f22178c',
    creationTimestamp: '2020-08-27T19:40:49Z',
  },
  spec: {
    description: 'my 3nd plan',
    provider: {
      sourceProvider: MOCK_PROVIDERS.vsphere[0],
      destinationProvider: MOCK_PROVIDERS.openshift[0],
    },
    map: {
      networks: [],
      datastores: [],
    },
    warm: false,
    vms: [vm1, vm2, vm1, vm2],
  },
  status: {
    conditions: [
      {
        category: 'Info',
        lastTransitionTime: '2020-09-10T16:04:10Z',
        message: 'Ready for migration',
        reason: 'Valid',
        status: true,
        type: 'Error',
      },
    ],
    observedGeneration: 2,
  },
};

const plan4: IPlan = {
  apiVersion: 'virt.konveyor.io/v1alpha1',
  kind: 'Plan',
  metadata: {
    name: 'plantest-4',
    namespace: 'openshift-migration',
    generation: 2,
    resourceVersion: '30825024',
    selfLink: '/apis/virt.konveyor.io/v1alpha1/namespaces/openshift-migration/plans/plantest-4',
    uid: '28fde094-b667-4d21-8f29-27c18f22178c',
    creationTimestamp: '2020-08-27T19:40:49Z',
  },
  spec: {
    description: 'my 4th plan',
    provider: {
      sourceProvider: MOCK_PROVIDERS.vsphere[0],
      destinationProvider: MOCK_PROVIDERS.openshift[0],
    },
    map: {
      networks: [],
      datastores: [],
    },
    warm: false,
    vms: [vm1, vm2],
  },
  status: {
    conditions: [
      {
        category: 'Info',
        lastTransitionTime: '2020-09-10T16:04:10Z',
        message: 'Ready for migration',
        reason: 'Valid',
        status: true,
        type: 'Finished',
      },
    ],
    observedGeneration: 2,
  },
};

export const MOCK_PLANS: IPlan[] = [plan1, plan2, plan3, plan4];

export const vmStatus1: IVMStatus = {
  id: 'vm1-id',
  pipeline: [
    {
      name: 'Step 1',
      progress: {
        total: 2,
        completed: 2,
      },
      phase: 'Latest message from controller',
    },
    {
      name: 'Step 2',
      progress: {
        total: 2,
        completed: 2,
      },
      phase: '',
    },
    {
      name: 'Step 3',
      progress: {
        total: 2,
        completed: 2,
      },
      phase: '',
    },
    {
      name: 'Step 4',
      progress: {
        total: 2,
        completed: 2,
      },
      phase: '',
    },
    {
      name: 'Copying data',
      progress: {
        total: 2,
        completed: 2,
      },
      phase: '',
    },
  ],
  step: 5,
  completed: false,
  error: {
    phase: '',
    reasons: [''],
  },
};

export const vmStatus2: IVMStatus = {
  id: 'vm1-id',
  pipeline: [
    {
      name: 'Step 1',
      progress: {
        total: 1,
        completed: 1,
      },
      phase: '',
    },
    {
      name: 'Step 2',
      progress: {
        total: 1,
        completed: 1,
      },
      phase: '',
    },
    {
      name: 'Step 3',
      progress: {
        total: 1,
        completed: 1,
      },
      phase: '',
    },
    {
      name: 'Step 4',
      progress: {
        total: 1,
        completed: 1,
      },
      phase: '',
    },
    {
      name: 'Step 5',
      progress: {
        total: 1,
        completed: 1,
      },
      phase: '',
    },
    {
      name: 'Step 6',
      progress: {
        total: 1,
        completed: 1,
      },
      phase: '',
    },
    {
      name: 'Step 7',
      progress: {
        total: 1,
        completed: 1,
      },
      phase: '',
    },
  ],
  step: 7,
  completed: true,
  error: {
    phase: '',
    reasons: [''],
  },
};
export const MOCK_VMSSTATUS: IVMStatus[] = [vmStatus2, vmStatus1];

export const migration1: IMigration = {
  id: 'VM1',
  plan: plan1,
  schedule: {
    begin: '09 Aug 2019, 08:19:11',
    end: '09 Aug 2019, 12:33:44',
  },
  status: { ready: true, storageReady: true, nbVMsDone: 1 },
  status2: vmStatus1,
  other: {
    copied: 93184,
    total: 125952,
    status: 'Ready',
  },
};

export const migration2: IMigration = {
  id: 'VM2',
  plan: plan2,
  schedule: {
    begin: '09 Aug 2019, 08:19:11',
    end: '09 Aug 2019, 12:33:44',
  },
  status: { ready: false, storageReady: true, nbVMsDone: 1 },
  status2: vmStatus2,
  other: {
    copied: 87952,
    total: 87952,
    status: 'Running',
  },
};

export const migration3: IMigration = {
  id: 'VM3',
  plan: plan3,
  schedule: {
    begin: '09 Aug 2019, 08:19:11',
    end: '09 Aug 2019, 09:43:12',
  },
  status: { ready: false, storageReady: true, nbVMsDone: 1 },
  status2: vmStatus2,
  other: {
    copied: 87952,
    total: 87952,
    status: 'Complete',
  },
};

export const migration4: IMigration = {
  id: 'VM4',
  plan: plan4,
  schedule: {
    begin: '09 Aug 2019, 11:34:56',
    end: '10 Aug 2019, 11:34:56',
  },
  status: { ready: false, storageReady: false, nbVMsDone: 2 },
  status2: vmStatus2,
  other: {
    copied: 87952,
    total: 87952,
    status: 'Failed',
  },
};

export const MOCK_MIGRATIONS: IMigration[] = [migration1, migration2, migration3, migration4];
