export const APP_TITLE = 'Migration Toolkit for Virtualization';

export const CLOUD_MA_LINK = {
  href: '#', // TODO
  label: 'cloud.redhat.com',
};

export enum ProviderType {
  vsphere = 'vsphere',
  cnv = 'cnv',
}

export const PROVIDER_TYPE_NAMES = {
  [ProviderType.vsphere]: 'VMware',
  [ProviderType.cnv]: 'OpenShift Virtualization',
};

export const SOURCE_PROVIDER_TYPES = [ProviderType.vsphere];
export const TARGET_PROVIDER_TYPES = [ProviderType.cnv];
