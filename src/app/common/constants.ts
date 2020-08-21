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
  [ProviderType.vsphere]: 'VMWare',
  [ProviderType.cnv]: 'OpenShift virtualization',
};
