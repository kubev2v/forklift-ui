import { IStorageMapping, MappingType } from '../../types';
import { ProviderType } from '@app/common/constants';

const storage1: IStorageMapping = {
  type: MappingType.Storage,
  name: 'vcenter1_datastore_to_OCPv_storageclass1',
  provider: {
    source: {
      type: ProviderType.vsphere,
      name: 'vcenter1',
    },
    target: {
      type: ProviderType.cnv,
      name: 'ocp1',
    },
  },
  items: [
    {
      source: {
        id: 'id1',
      },
      target: 'storageclass1',
    },
  ],
};

const storage2: IStorageMapping = {
  type: MappingType.Storage,
  name: 'vcenter1_datastore_to_OCPv_storageclass2',
  provider: {
    source: {
      type: ProviderType.vsphere,
      name: 'vcenter1',
    },
    target: {
      type: ProviderType.cnv,
      name: 'ocp1',
    },
  },
  items: [
    {
      source: {
        id: 'id2',
      },
      target: 'storageclass2',
    },
  ],
};

export const MOCK_STORAGE_MAPPINGS: IStorageMapping[] = [storage1, storage2];
