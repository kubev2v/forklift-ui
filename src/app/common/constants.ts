import { IVirtMetaVars } from './types';

export const APP_TITLE = 'Migration Toolkit for Virtualization';

export const CLOUD_MA_LINK = {
  href: 'https://cloud.redhat.com/migrations/migration-analytics',
  label: 'cloud.redhat.com',
};

export enum ProviderType {
  vsphere = 'vsphere',
  openshift = 'openshift',
}

export enum PlanStatusConditionsType {
  Ready = 'Ready',
  Execute = 'Execute',
  Finished = 'Finished',
  Error = 'Error',
}

export enum PlanStatusType {
  Ready = 'Ready',
  Execute = 'Running',
  Finished = 'Complete',
  Error = 'Failed',
}

export enum MigrationVMStepsType {
  PreHook = 'Pre Hook',
  DiskTransfer = 'Copying data',
  Import = 'Importing',
  PostHook = 'Post Hook',
  NotStarted = 'Not started',
  Completed = 'Complete',
  Error = 'Failed',
}

export const PROVIDER_TYPE_NAMES = {
  [ProviderType.vsphere]: 'VMware',
  [ProviderType.openshift]: 'OpenShift Virtualization',
};

export const SOURCE_PROVIDER_TYPES = [ProviderType.vsphere];
export const TARGET_PROVIDER_TYPES = [ProviderType.openshift];

export const VIRT_META: IVirtMetaVars = window['_virt_meta'];
