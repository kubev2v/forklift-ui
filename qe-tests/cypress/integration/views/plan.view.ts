export const planNameInput = '#plan-name';
export const planDescriptionInput = '#plan-description';
export const selectSourceProviderMenu = '#provider-select-vsphere-toggle';
export const selectDestProviderMenu = '#provider-select-openshift-toggle';
export const selectTargetNamespace = 'input.pf-c-form-control.pf-c-select__toggle-typeahead';
export const allDcCheckbox =
  '#converted-root > div > button > span.pf-c-tree-view__node-check > input[type=checkbox]';
export const searchInput = '#name-input';
export const mappingDropdown = 'button.pf-c-select__toggle';
export const kebab = '.pf-c-dropdown__toggle.pf-m-plain';
export enum dataLabel {
  name = '[data-label=Name]',
  sourceProvider = '[data-label="Source provider"]',
  targetProvider = '[data-label="Target provider"]',
  vms = '[data-label=VMs]',
  status = '[data-label="Plan status"]',
}
