import { IVMwareProvider, ICNVProvider, IProvidersByType } from '../types/providers.types';
import { ProviderType } from '@app/common/constants';

const vmwareProvider1: IVMwareProvider = {
  uid: 'foo-uid',
  version: '12345',
  namespace: 'openshift-migration',
  name: 'VCenter1',
  selfLink: '/foo/bar',
  type: ProviderType.vsphere,
  object: {
    metadata: {
      name: 'VCenter1',
      namespace: 'openshift-migration',
      selfLink: '/foo/bar',
      uid: 'foo-uid',
      resourceVersion: '12345',
      generation: 1,
      creationTimestamp: '2020-08-21T18:36:41.468Z',
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
  },
  datacenterCount: 1,
  clusterCount: 2,
  hostCount: 15,
  vmCount: 41,
  networkCount: 8,
  datastoreCount: 3,
};

const vmwareProvider2: IVMwareProvider = {
  ...vmwareProvider1,
  name: 'VCenter2',
  object: {
    ...vmwareProvider1.object,
    metadata: {
      ...vmwareProvider1.object.metadata,
      name: 'VCenter2',
    },
  },
};

const vmwareProvider3: IVMwareProvider = {
  ...vmwareProvider1,
  name: 'VCenter3',
  object: {
    ...vmwareProvider1.object,
    metadata: {
      ...vmwareProvider1.object.metadata,
      name: 'VCenter3',
    },
  },
};

const cnvProvider1: ICNVProvider = {
  ...vmwareProvider1,
  object: {
    ...vmwareProvider1.object,
    metadata: {
      ...vmwareProvider1.object.metadata,
      name: 'OCPv_1',
    },
    spec: {
      ...vmwareProvider1.object.spec,
      type: ProviderType.cnv, // TODO ???
      url: 'https://my_OCPv_url',
    },
  },
  namespaceCount: 41,
  vmCount: 26,
  networkCount: 8,
};

const cnvProvider2: ICNVProvider = {
  ...cnvProvider1,
  name: 'OCPv_2',
  object: {
    ...cnvProvider1.object,
    metadata: {
      ...cnvProvider1.object.metadata,
      name: 'OCPv_2',
    },
  },
};

const cnvProvider3: ICNVProvider = {
  ...cnvProvider1,
  name: 'OCPv_3',
  object: {
    ...cnvProvider1.object,
    metadata: {
      ...cnvProvider1.object.metadata,
      name: 'OCPv_3',
    },
  },
};

export const MOCK_PROVIDERS: IProvidersByType = {
  [ProviderType.vsphere]: [vmwareProvider1, vmwareProvider2, vmwareProvider3],
  [ProviderType.cnv]: [cnvProvider1, cnvProvider2, cnvProvider3],
};
