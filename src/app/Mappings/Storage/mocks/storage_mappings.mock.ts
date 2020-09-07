import { IStorageMapping, IStorageMappingItem, MappingType } from '../../types';
import { ProviderType } from '@app/common/constants';

const storage1: IStorageMapping = {
  type: MappingType.Storage,
  name: 'vcenter1_datastore_to_OCPv_storageclass1',
  provider: {
    type: ProviderType.vsphere,
    name: 'vcenter1',
  },
  items: [
    {
      src: {
        id: 'id1',
      },
      target: {
        storageClass: 'storageclass1',
      },
    },
  ],
};

const storage2: IStorageMapping = {
  type: MappingType.Storage,
  name: 'vcenter1_datastore_to_OCPv_storageclass2',
  provider: {
    type: ProviderType.vsphere,
    name: 'vcenter1',
  },
  items: [
    {
      src: {
        id: 'id2',
      },
      target: {
        storageClass: 'storageclass2',
      },
    },
  ],
};

export const MOCK_STORAGE_MAPPINGS: IStorageMapping[] = [storage1, storage2];
