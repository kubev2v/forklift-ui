import { IVMwareDatastore, IVMwareDatastoresByProvider } from '../types/providers.types';

const someVMwareDatastores: IVMwareDatastore[] = [
  { id: '1', name: 'vmware-datastore-1' },
  { id: '2', name: 'vmware-datastore-2' },
  { id: '3', name: 'vmware-datastore-3' },
  { id: '4', name: 'vmware-datastore-4' },
  { id: '5', name: 'vmware-datastore-5' },
];

export const MOCK_VMWARE_DATASTORES_BY_PROVIDER: IVMwareDatastoresByProvider = {
  VCenter1: [...someVMwareDatastores],
  VCenter2: [...someVMwareDatastores],
  VCenter3: [...someVMwareDatastores],
};
