import { IVMwareDatastore, IVMwareDatastoresByProvider } from '../types/providers.types';

export let MOCK_VMWARE_DATASTORES_BY_PROVIDER: IVMwareDatastoresByProvider = {};

// TODO put this condition back when we don't directly import mocks into components anymore
// if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
const someVMwareDatastores: IVMwareDatastore[] = [
  { id: '1', name: 'vmware-datastore-1' },
  { id: '2', name: 'vmware-datastore-2' },
  { id: '3', name: 'vmware-datastore-3' },
  { id: '4', name: 'vmware-datastore-4' },
  { id: '5', name: 'vmware-datastore-5' },
];

MOCK_VMWARE_DATASTORES_BY_PROVIDER = {
  VCenter1: [...someVMwareDatastores],
  VCenter2: [...someVMwareDatastores],
  VCenter3: [...someVMwareDatastores],
};
// }
