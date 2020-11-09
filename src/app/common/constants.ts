import * as yup from 'yup';

import { IVirtMetaVars } from './types';

export const APP_TITLE = 'Migration Toolkit for Virtualization';

export const CLUSTER_API_VERSION = 'virt.konveyor.io/v1alpha1';

export const CLOUD_MA_LINK = {
  href: 'https://cloud.redhat.com/migrations/migration-analytics',
  label: 'cloud.redhat.com',
};

export enum ProviderType {
  vsphere = 'vsphere',
  openshift = 'openshift',
}

export enum StatusCategoryType {
  Required = 'Required',
  Critical = 'Critical',
  Error = 'Error',
  Advisory = 'Advisory',
  Warn = 'Warn',
}

export enum PlanStatusAPIType {
  Ready = 'Ready',
  Executing = 'Executing',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
}

export enum PlanStatusDisplayType {
  Ready = 'Ready',
  Executing = 'Running',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Initializing = 'Initializing',
}

export enum MigrationVMStepsType {
  PreHook = 'Pre Hook',
  DiskTransfer = 'Copying data',
  ImageConversion = 'Converting guest image',
  Import = 'Importing',
  PostHook = 'Post Hook',
  NotStarted = 'Not started',
  Completed = 'Complete',
  Error = 'Failed',
}

export enum StepType {
  Full = 'Full',
  Half = 'Half',
  Empty = 'Empty',
}

export const PROVIDER_TYPE_NAMES = {
  [ProviderType.vsphere]: 'VMware',
  [ProviderType.openshift]: 'OpenShift Virtualization',
};

export const SOURCE_PROVIDER_TYPES = [ProviderType.vsphere];
export const TARGET_PROVIDER_TYPES = [ProviderType.openshift];

export const VIRT_META: IVirtMetaVars =
  process.env.DATA_SOURCE !== 'mock'
    ? window['_virt_meta']
    : {
        clusterApi: '/mock/api',
        devServerPort: 'mock-port',
        oauth: {
          clientId: 'mock-client-id',
          redirectUri: '/mock/redirect/uri',
          userScope: '/mock/user-scope',
          clientSecret: 'mock-client-secret',
        },
        namespace: 'mock-namespace',
        configNamespace: 'mock-namespace',
        inventoryApi: '/mock/api',
        inventoryPayloadApi: '/mock/api',
      };

export const dnsLabelNameSchema = yup
  .string()
  .max(63)
  .matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
    message: ({ label }) =>
      `${label} can only contain lowercase alphanumeric characters and dashes (-), and must start and end with an alphanumeric character`,
    excludeEmptyString: true,
  });

export const urlSchema = yup.string().test('is-valid-url', 'Must be a valid URL', (value) => {
  try {
    new URL(value as string);
  } catch (_) {
    return false;
  }
  return true;
});
