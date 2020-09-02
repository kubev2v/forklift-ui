import { IVMwareProvider, ICNVProvider, Provider } from '../types';
import { ProviderType } from '@app/common/constants';

const vmwareProvider1: IVMwareProvider = {
  metadata: {
    name: 'VCenter1',
    namespace: 'openshift-migration',
    selfLink: '/foo/bar',
    uid: 'foo-uid',
    resourceVersion: '12345',
    generation: 1,
    creationTimestamp: '2020-08-21T18:36:41.468Z',
  },
  // TODO this resourceCounts prop is speculative
  // need to look at the real structure once Jeff implements this part
  resourceCounts: {
    numClusters: 2,
    numHosts: 15,
    numVMs: 41,
    numNetworks: 8,
    numDatastores: 3,
  },
  spec: {
    type: ProviderType.vsphere,
    url: 'vcenter.v2v.bos.redhat.com',
    secret: {
      namespace: 'openshift-migration',
      name: 'boston',
    },
  },
  status: {
    conditions: [
      {
        type: 'Ready',
        status: 'True',
        category: 'Required',
        message: 'The provider is ready.',
        lastTransitionTime: '2020-08-21T18:36:41.468Z',
      },
    ],
    observedGeneration: 1,
  },
};

const vmwareProvider2: IVMwareProvider = {
  ...vmwareProvider1,
  metadata: {
    ...vmwareProvider1.metadata,
    name: 'VCenter2',
  },
};

const vmwareProvider3: IVMwareProvider = {
  ...vmwareProvider1,
  metadata: {
    ...vmwareProvider1.metadata,
    name: 'VCenter3',
  },
};

const cnvProvider1: ICNVProvider = {
  ...vmwareProvider1,
  metadata: {
    ...vmwareProvider1.metadata,
    name: 'OCPv_1',
    storageClasses: ['gold', 'silver', 'bronze'],
  },
  resourceCounts: {
    numNamespaces: 41,
    numVMs: 26,
    numNetworks: 8,
  },
  spec: {
    ...vmwareProvider1.spec,
    type: ProviderType.cnv, // TODO ???
    url: 'https://my_OCPv_url',
  },
};

const cnvProvider2: ICNVProvider = {
  ...cnvProvider1,
  metadata: {
    ...cnvProvider1.metadata,
    name: 'OCPv_2',
  },
};

const cnvProvider3: ICNVProvider = {
  ...cnvProvider1,
  metadata: {
    ...cnvProvider1.metadata,
    name: 'OCPv_3',
  },
};

export const MOCK_PROVIDERS: Provider[] = [
  vmwareProvider1,
  vmwareProvider2,
  vmwareProvider3,
  cnvProvider1,
  cnvProvider2,
  cnvProvider3,
];
