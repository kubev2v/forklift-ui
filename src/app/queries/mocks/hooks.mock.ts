import { IHook } from '../types';
import { CLUSTER_API_VERSION } from '@app/common/constants';

export let MOCK_HOOKS: IHook[];

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  const hook1 = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Hook',
    metadata: {
      name: 'hooktest-01',
      namespace: 'openshift-migration',
      generation: 1,
      resourceVersion: '30825024',
      selfLink:
        '/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-migration/hooks/hooktest-01',
      uid: '28fde094-b667-4d21-8f29-28c18f22178c',
      creationTimestamp: '2021-05-04T19:40:49Z',
    },
    spec: {
      url: 'https://git.example.com/hooks/hooktest-01',
      branch: 'main',
    },
  };

  const hook2 = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Hook',
    metadata: {
      name: 'hooktest-02',
      namespace: 'openshift-migration',
      generation: 1,
      resourceVersion: '30825024',
      selfLink:
        '/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-migration/hooks/hooktest-02',
      uid: '28fde094-b667-4d21-8f29-28c18f22178b',
      creationTimestamp: '2021-05-04T19:40:50Z',
    },
    spec: {
      url: 'https://git.example.com/hooks/hooktest-02',
      branch: 'feature',
    },
  };

  MOCK_HOOKS = [hook1, hook2];
}
