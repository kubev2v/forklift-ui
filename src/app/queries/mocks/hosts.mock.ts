import { IHost } from '../types/providers.types';

export let MOCK_HOSTS: IHost[] = [];

// TODO put this condition back when we don't directly import mocks into components anymore
if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  MOCK_HOSTS = [
    {
      name: 'host1',
      network: {
        name: 'management network',
        address: '192.168.0.0/24',
        isDefault: true,
      },
      bandwidth: '1 GB / s',
      mtu: 1499,
    },
  ];
}
