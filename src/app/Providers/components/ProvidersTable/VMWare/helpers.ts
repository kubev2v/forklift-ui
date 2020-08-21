import { IHost } from '@app/Providers/types';

export const formatHostNetwork = (host: IHost): string => {
  const { name, address, isDefault } = host.metadata.network;
  return `${name} - ${address}${isDefault ? ' (default)' : ''}`;
};
