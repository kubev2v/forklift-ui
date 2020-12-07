import { configMatchesHost } from '@app/queries';
import { IHost, IHostConfig, IHostNetworkAdapter, IVMwareProvider } from '@app/queries/types';

export const findHostConfig = (
  host: IHost,
  hostConfigs: IHostConfig[],
  provider: IVMwareProvider | null
): IHostConfig | null =>
  (provider && hostConfigs.find((config) => configMatchesHost(config, host, provider))) || null;

export const findSelectedNetworkAdapter = (
  host: IHost,
  hostConfig: IHostConfig | null
): IHostNetworkAdapter | null => {
  if (!hostConfig) return null;
  return (
    host.networkAdapters.find((adapter) => adapter.ipAddress === hostConfig?.spec.ipAddress) || null
  );
};

export const formatHostNetworkAdapter = (network: IHostNetworkAdapter): string => {
  if (network) {
    return network.name;
  }
  return 'Network not found';
};
