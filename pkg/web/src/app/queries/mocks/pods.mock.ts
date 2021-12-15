import { META } from '@app/common/constants';
import { IPodObject } from '@app/queries/types';

export let MOCK_PODS: {
  [mockClusterType: string]: IPodObject[];
};
export let MOCK_PLAN_PODS: IPodObject[];
export let MOCK_CLUSTER_PODS: IPodObject[];

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  const pod1: IPodObject = {
    apiVersion: '00000',
    kind: 'foo-kind',
    metadata: {
      namespace: 'openshift-migration',
      name: 'forklift-controller-7db68559b8-tsgh9',
    },
    spec: {
      containers: [
        {
          name: 'controller',
        },
        {
          name: 'inventory',
        },
      ],
    },
  };

  const pod2: IPodObject = {
    apiVersion: '00000',
    kind: 'foo-kind',
    metadata: {
      namespace: 'openshift-migration',
      name: 'forklift-must-gather-api-646c6cfdc-dqg8k',
    },
    spec: {
      containers: [
        {
          name: 'forklift-must-gather-api',
        },
      ],
    },
  };

  const pod3: IPodObject = {
    apiVersion: '00000',
    kind: 'foo-kind',
    metadata: {
      namespace: 'openshift-migration',
      name: 'forklift-operator-7f56dfb5c-nh6fr',
    },
    spec: {
      containers: [
        {
          name: 'forklift-operator',
        },
      ],
    },
  };

  const pod4: IPodObject = {
    apiVersion: '00000',
    kind: 'foo-kind',
    metadata: {
      namespace: 'openshift-migration',
      name: 'forklift-ui-7b7c864d4c-f225q',
    },
    spec: {
      containers: [
        {
          name: 'forklift-ui',
        },
      ],
    },
  };

  const pod5: IPodObject = {
    apiVersion: '00000',
    kind: 'foo-kind',
    metadata: {
      namespace: 'openshift-migration',
      name: 'forklift-validation-594c88894-8ttgd',
    },
    spec: {
      containers: [
        {
          name: 'forklift-validation',
        },
      ],
    },
  };

  const pod6: IPodObject = {
    apiVersion: '00000',
    kind: 'foo-kind',
    metadata: {
      namespace: META.namespace,
      name: 'importer-mock-resource-01-vm-1630-xxxx',
    },
    spec: {
      containers: [
        {
          name: 'forklift-validation',
        },
      ],
    },
  };

  const pod7: IPodObject = {
    apiVersion: '00000',
    kind: 'foo-kind',
    metadata: {
      namespace: META.namespace,
      name: 'importer-mock-resource-02-vm-2844-xxxx',
    },
    spec: {
      containers: [
        {
          name: 'forklift-validation',
        },
      ],
    },
  };

  MOCK_CLUSTER_PODS = [pod1, pod2, pod3, pod4, pod5];
  MOCK_PLAN_PODS = [pod6, pod7];

  MOCK_PODS = {
    [`${META.namespace}`]: MOCK_CLUSTER_PODS,
    'openshift-migration': MOCK_PLAN_PODS,
  };
}
