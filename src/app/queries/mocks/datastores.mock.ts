import { IVMwareDatastore } from '../types';

export let MOCK_VMWARE_DATASTORES: IVMwareDatastore[] = [];

// TODO put this condition back when we don't directly import mocks into components anymore
// if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
const mockVmwareDatastore1: IVMwareDatastore = {
  id: '1',
  parent: {
    kind: 'Folder',
    id: 'group-1',
  },
  name: 'vmware-datastore-1',
  selfLink: '/foo/vmwaredatastore/1',
  type: 'VMFS',
  capacity: 1048576,
  free: 1048576,
  maintenance: 'normal',
};

MOCK_VMWARE_DATASTORES = [
  mockVmwareDatastore1,
  {
    ...mockVmwareDatastore1,
    id: '2',
    name: 'vmware-datastore-2',
    selfLink: '/foo/vmwaredatastore/2',
  },
  {
    ...mockVmwareDatastore1,
    id: '3',
    name: 'vmware-datastore-3',
    selfLink: '/foo/vmwaredatastore/3',
  },
  {
    ...mockVmwareDatastore1,
    id: '4',
    name: 'vmware-datastore-4',
    selfLink: '/foo/vmwaredatastore/4',
  },
  {
    ...mockVmwareDatastore1,
    id: '5',
    name: 'vmware-datastore-5',
    selfLink: '/foo/vmwaredatastore/5',
  },
];
// }
