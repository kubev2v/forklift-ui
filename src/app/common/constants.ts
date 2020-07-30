export const APP_TITLE = 'Migration Toolkit for Virtualization';

export const CLOUD_MA_LINK = {
  href: '#', // TODO
  label: 'cloud.redhat.com',
};

export enum ProviderType {
  vmware = 'vmware',
  cnv = 'cnv',
}

export const PROVIDER_TYPE_NAMES = {
  [ProviderType.vmware]: 'VMWare',
  [ProviderType.cnv]: 'OpenShift virtualization',
};
