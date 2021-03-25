import {
  IVMwareProvider,
  IOpenShiftProvider,
  IProvidersByType,
  IProviderObject,
} from '../types/providers.types';
import { ProviderType } from '@app/common/constants';

export let MOCK_INVENTORY_PROVIDERS: IProvidersByType = {
  [ProviderType.vsphere]: [],
  [ProviderType.openshift]: [],
};

export let MOCK_CLUSTER_PROVIDERS: IProviderObject[];

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  const vmwareProvider1: IVMwareProvider = {
    uid: '1',
    version: '12345',
    namespace: 'openshift-migration',
    name: 'vcenter-1',
    selfLink: '/foo/vmwareprovider/1',
    type: ProviderType.vsphere,
    object: {
      apiVersion: '12345',
      kind: 'foo-kind',
      metadata: {
        name: 'vcenter-1',
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
            category: 'Required',
            lastTransitionTime: '2021-03-18T21:01:10Z',
            message: 'Connection test, succeeded.',
            reason: 'Tested',
            status: 'True',
            type: 'ConnectionTested',
          },
          {
            category: 'Advisory',
            lastTransitionTime: '2021-02-08T19:36:55Z',
            message: 'Validation has been completed.',
            reason: 'Completed',
            status: 'True',
            type: 'Validated',
          },
          {
            category: 'Required',
            lastTransitionTime: '2021-03-23T16:58:23Z',
            message: 'The inventory has been loaded.',
            reason: 'Completed',
            status: 'True',
            type: 'InventoryCreated',
          },
          {
            category: 'Required',
            lastTransitionTime: '2021-03-23T16:58:23Z',
            message: 'The provider is ready.',
            status: 'True',
            type: 'Ready',
          },
        ],
        observedGeneration: 1,
      },
    },
    datacenterCount: 1,
    clusterCount: 2,
    hostCount: 2,
    vmCount: 41,
    networkCount: 8,
    datastoreCount: 3,
  };

  const vmwareProvider2: IVMwareProvider = {
    ...vmwareProvider1,
    uid: '2',
    name: 'vcenter-2',
    selfLink: '/foo/vmwareprovider/2',
    object: {
      ...vmwareProvider1.object,
      metadata: {
        ...vmwareProvider1.object.metadata,
        name: 'vcenter-2',
      },
      status: {
        conditions: [
          {
            type: 'URLNotValid',
            status: 'True',
            category: 'Critical',
            message: 'The provider is not responding.',
            lastTransitionTime: '2020-08-21T18:36:41.468Z',
            reason: '',
          },
        ],
        observedGeneration: 1,
      },
    },
  };

  const vmwareProvider3: IVMwareProvider = {
    ...vmwareProvider1,
    uid: '3',
    name: 'vcenter-3',
    selfLink: '/foo/vmwareprovider/3',
    object: {
      ...vmwareProvider1.object,
      metadata: {
        ...vmwareProvider1.object.metadata,
        name: 'vcenter-3',
      },
      status: {
        conditions: [
          {
            category: 'Required',
            lastTransitionTime: '2021-03-18T21:01:10Z',
            message: 'Connection test, succeeded.',
            reason: 'Tested',
            status: 'True',
            type: 'ConnectionTested',
          },
          {
            category: 'Advisory',
            lastTransitionTime: '2021-02-08T19:36:55Z',
            message: 'Validation has been completed.',
            reason: 'Completed',
            status: 'True',
            type: 'Validated',
          },
          {
            category: 'Advisory',
            lastTransitionTime: '2021-03-23T16:58:23Z',
            message: 'Loading the inventory.',
            reason: 'Started',
            status: 'True',
            type: 'InventoryLoading',
          },
        ],
        observedGeneration: 1,
      },
    },
  };

  const openshiftProvider1: IOpenShiftProvider = {
    ...vmwareProvider1,
    uid: '1',
    name: 'ocpv-1',
    selfLink: '/foo/openshiftprovider/1',
    type: ProviderType.openshift,
    object: {
      ...vmwareProvider1.object,
      metadata: {
        ...vmwareProvider1.object.metadata,
        name: 'ocpv-1',
        annotations: {
          'forklift.konveyor.io/defaultTransferNetwork': 'ocp-network-3',
        },
      },
      spec: {
        ...vmwareProvider1.object.spec,
        type: ProviderType.openshift,
        url: 'https://my_OCPv_url',
      },
    },
    namespaceCount: 41,
    vmCount: 26,
    networkCount: 8,
  };

  const openshiftProvider2: IOpenShiftProvider = {
    ...openshiftProvider1,
    uid: '2',
    name: 'ocpv-2',
    selfLink: '/foo/openshiftprovider/2',
    object: {
      ...openshiftProvider1.object,
      metadata: {
        ...openshiftProvider1.object.metadata,
        name: 'ocpv-2',
      },
      status: {
        conditions: [
          {
            type: 'URLNotValid',
            status: 'True',
            category: 'Critical',
            message: 'The provider is not responding.',
            lastTransitionTime: '2020-08-21T18:36:41.468Z',
            reason: '',
          },
        ],
        observedGeneration: 1,
      },
    },
  };

  const openshiftProvider3: IOpenShiftProvider = {
    ...openshiftProvider1,
    uid: '3',
    name: 'ocpv-3',
    selfLink: '/foo/openshiftprovider/3',
    object: {
      ...openshiftProvider1.object,
      metadata: {
        ...openshiftProvider1.object.metadata,
        name: 'ocpv-3',
      },
    },
  };

  MOCK_INVENTORY_PROVIDERS = {
    [ProviderType.vsphere]: [vmwareProvider1, vmwareProvider2, vmwareProvider3],
    [ProviderType.openshift]: [openshiftProvider1, openshiftProvider2, openshiftProvider3],
  };

  MOCK_CLUSTER_PROVIDERS = [
    ...MOCK_INVENTORY_PROVIDERS[ProviderType.vsphere],
    ...MOCK_INVENTORY_PROVIDERS[ProviderType.openshift],
  ].map((inventoryProvider) => ({ ...inventoryProvider.object }));
}
