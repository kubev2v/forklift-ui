import { INetworkMapping, MappingType } from '../../types';
import { ProviderType } from '@app/common/constants';
import { NetworkType } from '@app/Providers/types';

const networkMap1: INetworkMapping = {
  type: MappingType.Network,
  name: 'vcenter1_network_to_OCPv_network1',
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
        type: NetworkType.Pod,
        name: 'network1',
        namespace: '',
      },
    },
  ],
};

const networkMap2: INetworkMapping = {
  type: MappingType.Network,
  name: 'vcenter1_network_to_OCPv_network2',
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
        type: NetworkType.Pod,
        name: 'network2',
        namespace: '',
      },
    },
  ],
};

export const MOCK_NETWORK_MAPPINGS: INetworkMapping[] = [networkMap1, networkMap2];
