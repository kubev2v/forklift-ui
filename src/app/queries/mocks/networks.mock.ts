import { IVMwareNetwork, IOpenShiftNetwork } from '../types';

export let MOCK_VMWARE_NETWORKS: IVMwareNetwork[] = [];
export let MOCK_OPENSHIFT_NETWORKS: IOpenShiftNetwork[] = [];

// TODO put this condition back when we don't directly import mocks into components anymore
// if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
MOCK_VMWARE_NETWORKS = [
  {
    id: '1',
    parent: {
      Kind: 'Folder',
      ID: 'group-123',
    },
    name: 'vmware-network-1',
    selfLink: '/foo/bar',
  },
  {
    id: '2',
    parent: {
      Kind: 'Folder',
      ID: 'group-123',
    },
    name: 'vmware-network-2',
    selfLink: '/foo/bar',
  },
  {
    id: '3',
    parent: {
      Kind: 'Folder',
      ID: 'group-123',
    },
    name: 'vmware-network-3',
    selfLink: '/foo/bar',
  },
  {
    id: '4',
    parent: {
      Kind: 'Folder',
      ID: 'group-123',
    },
    name: 'vmware-network-4',
    selfLink: '/foo/bar',
  },
  {
    id: '5',
    parent: {
      Kind: 'Folder',
      ID: 'group-123',
    },
    name: 'vmware-network-5',
    selfLink: '/foo/bar',
  },
];

MOCK_OPENSHIFT_NETWORKS = [
  {
    uid: 'foo-network-uid-1',
    version: '12345',
    namespace: 'foo-namespace',
    name: 'ocp-network-1',
    selfLink: '/foo/bar',
  },
  {
    uid: 'foo-network-uid-2',
    version: '12345',
    namespace: 'foo-namespace',
    name: 'ocp-network-2',
    selfLink: '/foo/bar',
  },
  {
    uid: 'foo-network-uid-3',
    version: '12345',
    namespace: 'foo-namespace',
    name: 'ocp-network-3',
    selfLink: '/foo/bar',
  },
  {
    uid: 'foo-network-uid-4',
    version: '12345',
    namespace: 'foo-namespace',
    name: 'ocp-network-4',
    selfLink: '/foo/bar',
  },
  {
    uid: 'foo-network-uid-5',
    version: '12345',
    namespace: 'foo-namespace',
    name: 'ocp-network-5',
    selfLink: '/foo/bar',
  },
];
// }
