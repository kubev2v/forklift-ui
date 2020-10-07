import { IHostNetwork } from '@app/queries/types';

export const formatHostNetwork = (network: IHostNetwork): string => {
  const { name, address, isDefault } = network;
  return `${name} - ${address}${isDefault ? ' (default)' : ''}`;
};
