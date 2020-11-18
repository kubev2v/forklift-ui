import { IHostNetworkAdapter } from '@app/queries/types';

export const formatHostNetworkAdapter = (network: IHostNetworkAdapter): string => {
  if (network) {
    return `${network.name} - ${network.ipAddress}`;
  }
  return 'Network not found';
};
