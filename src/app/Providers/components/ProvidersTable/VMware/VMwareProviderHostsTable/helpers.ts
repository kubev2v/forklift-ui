import { IHostNetwork } from '@app/Providers/types';

export const formatHostNetwork = (network: IHostNetwork): string => {
  const { name, address, isDefault } = network;
  return `${name} - ${address}${isDefault ? ' (default)' : ''}`;
};
