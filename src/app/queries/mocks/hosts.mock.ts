import { IHost } from '../types/providers.types';

// TODO put this condition back when we don't directly import mocks into components anymore
// if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
export const host1: IHost = {
  name: 'host1',
  network: {
    name: 'storage network',
    address: '192.168.0.1/24',
    isDefault: true,
  },
  bandwidth: '1 GB/s',
  mtu: 1499,
};

export const host2: IHost = {
  name: 'host2',
  network: {
    name: 'compute network',
    address: '192.168.0.2/24',
    isDefault: false,
  },
  bandwidth: '2 GB/s',
  mtu: 1400,
};

export const host3: IHost = {
  name: 'host3',
  network: {
    name: 'management network',
    address: '192.168.0.3/24',
    isDefault: false,
  },
  bandwidth: '3 GB/s',
  mtu: 1500,
};

export const MOCK_HOSTS: IHost[] = [host1, host2, host3];
