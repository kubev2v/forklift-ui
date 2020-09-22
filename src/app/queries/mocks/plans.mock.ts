import { IPlan, IMigration } from '../types/plans.types';
import { MOCK_PROVIDERS } from '@app/queries/mocks/providers.mock';
import { vm1, vm2 } from '@app/Plans/mocks/VMs.mock';

const plan1: IPlan = {
  apiVersion: 'virt.konveyor.io/v1alpha1',
  kind: 'Plan',
  metadata: {
    name: 'plantest1',
    namespace: 'openshift-migration',
    generation: 2,
    resourceVersion: '30825024',
    selfLink: '/apis/virt.konveyor.io/v1alpha1/namespaces/openshift-migration/plans/plantest1',
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
    vmList: [vm1, vm2],
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
    ],
    observedGeneration: 2,
  },
};

const plan2: IPlan = {
  apiVersion: 'virt.konveyor.io/v1alpha1',
  kind: 'Plan',
  metadata: {
    name: 'plantest1',
    namespace: 'openshift-migration',
    generation: 2,
    resourceVersion: '30825024',
    selfLink: '/apis/virt.konveyor.io/v1alpha1/namespaces/openshift-migration/plans/plantest1',
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
    vmList: [vm1],
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

export const MOCK_PLANS: IPlan[] = [plan1, plan2];

export const migration1: IMigration = {
  plan: plan1,
  schedule: {
    begin: Date.parse('04 Dec 2020 00:12:00 GMT'),
    end: Date.parse('05 Dec 2020 00:12:00 GMT'),
  },
  status: { ready: true, storageReady: true, nbVMsDone: 1 },
};

export const migration2: IMigration = {
  plan: plan2,
  schedule: {
    begin: Date.parse('10 Janv 2021 00:00:00 GMT'),
    end: Date.parse('12 Janv 2021 00:00:00 GMT'),
  },
  status: { ready: true, storageReady: true, nbVMsDone: 0 },
};

export const migration3: IMigration = {
  plan: plan1,
  schedule: {
    begin: Date.parse('04 Dec 2020 00:12:00 GMT'),
    end: Date.parse('05 Dec 2020 00:12:00 GMT'),
  },
  status: { ready: false, storageReady: true, nbVMsDone: 2 },
};

export const migration4: IMigration = {
  plan: plan2,
  schedule: {
    begin: Date.parse('10 Janv 2021 00:00:00 GMT'),
    end: Date.parse('12 Janv 2021 00:00:00 GMT'),
  },
  status: { ready: false, storageReady: true, nbVMsDone: 0 },
};

export const MOCK_MIGRATIONS: IMigration[] = [migration1, migration2];
