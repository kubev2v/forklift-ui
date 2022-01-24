export const button = 'button';
export const nextButton = 'Next';
export const loginButton = 'Log in';
export const vmware = 'VMware';
export const rhv = 'Red Hat Virtualization';
export const ocpVirt = 'OpenShift Virtualization';
export const addProvider = 'Add provider';
export const selectProviderType = 'Select a provider type...';
export const removeButton = 'Remove';
export const deleteButton = 'Delete';
export const editButton = 'Edit';
export const selectProvider = 'Select a provider...';
// export const tProvider = 'Select a provider...';
export const selectSource = 'Select source...';
export const selectTarget = 'Select target...';
export const create = 'Create';
export const network = 'Network';
export const storage = 'Storage';
export const trTag = 'tr';
export const tdTag = 'td';
export const mappings = 'Mappings';
export const createMapping = 'Create mapping';
export const migrationPLan = 'Migration Plans';
export const createPlan = 'Create plan';
// export const createPlan = 'Create migration plan';
export const addButton = 'Add';
export const saveButton = 'Save';
export const selectANetworkMapping = 'Select a network mapping';
export const selectAStorageMapping = 'Select a storage mapping';
export const planSuccessMessage = 'Succeeded';
export const planCanceledMessage = 'Canceled';
export const planFailedMessage = 'Failed';
export const SEC = 1000;
export const CreateNewNetworkMapping = 'Create a network mapping';
export const CreateNewStorageMapping = 'Create a storage mapping';
export const restartButton = 'Restart';
export const duplicateButton = 'Duplicate';
export const archiveButton = 'Archive';
export const finishButton = 'Finish';
export const start = 'Start';
export const review = 'Review';
export const cutover = 'Cutover';
export const selectMigrationNetwork = 'Select migration network';
export const podNetwork = 'Pod network';
export const differentNetwork = 'Select a different network';
export enum hooks {
  image = 'Custom container image',
  ansiblePlaybook = 'Ansible Playbook',
}
export enum storageType {
  nfs = 'nfs',
  cephRbd = 'ocs-storagecluster-ceph-rbd',
}

export enum migrationType {
  cold = 'Cold migration',
  warm = 'Warm migration',
}

export enum providerType {
  vmware = 'VMware',
  rhv = 'Red Hat Virtualization',
  ocpv = 'OpenShift Virtualization',
}

export enum summaryTitle {
  planName = 'Plan name',
  sProvider = 'Source provider',
  tProvider = 'Target provider',
  tNamespace = 'Target namespace',
}

export enum hookType {
  prehook = 'Pre-migration',
  posthook = 'Post-migration',
}
