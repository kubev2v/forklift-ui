import { IHost, IHostsByProvider } from '../types/providers.types';

const host1: IHost = {
  metadata: {
    name: 'host1',
    network: {
      name: 'management network',
      address: '192.168.0.0/24',
      isDefault: true,
    },
    bandwidth: '1 GB / s',
    mtu: 1499,
  },
};

const host2: IHost = {
  ...host1,
  metadata: {
    ...host1.metadata,
    name: 'host2',
  },
};

const host3: IHost = {
  ...host1,
  metadata: {
    ...host1.metadata,
    name: 'host3',
  },
};

export const MOCK_HOSTS_BY_PROVIDER: IHostsByProvider = {
  VCenter1: [host1, host2, host3],
  VCenter2: [host1, host2, host3],
  VCenter3: [host1, host2, host3],
};
