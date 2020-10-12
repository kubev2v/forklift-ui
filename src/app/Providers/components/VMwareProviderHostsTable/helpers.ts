import { IHostNetwork } from '@app/queries/types';

export const formatHostNetwork = (network: IHostNetwork): string => {
  if (network) {
    const { name, address, isDefault } = network;
    return `${name} - ${address}${isDefault ? ' (default)' : ''}`;
  }
  return 'Network not found';
};
