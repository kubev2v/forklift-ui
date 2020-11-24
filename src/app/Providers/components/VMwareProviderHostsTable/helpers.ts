import { configMatchesHost } from '@app/queries';
import { IHost, IHostConfig, IHostNetworkAdapter, IVMwareProvider } from '@app/queries/types';

export const findSelectedNetworkAdapter = (
  host: IHost,
  hostConfigs: IHostConfig[],
  provider: IVMwareProvider | null
): IHostNetworkAdapter | null => {
  const matchingConfig =
    provider && hostConfigs.find((config) => configMatchesHost(config, host, provider));
  if (!matchingConfig) return null;
  return (
    host.networkAdapters.find((adapter) => adapter.ipAddress === matchingConfig?.spec.ipAddress) ||
    null
  );
};

export const formatHostNetworkAdapter = (network: IHostNetworkAdapter): string => {
  if (network) {
    return `${network.name} - ${network.ipAddress}`;
  }
  return 'Network not found';
};
