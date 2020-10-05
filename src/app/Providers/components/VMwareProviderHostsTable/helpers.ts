import { IHostNetwork } from '@app/queries/types';

export const formatHostNetwork = (network: IHostNetwork): string => {
  const { name, address, isDefault } = network;
  const line = `${name} - ${address}${isDefault ? ' (default)' : ''}`;
  return line;
};
