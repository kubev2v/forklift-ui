import { ProviderVmware } from '../../../models/providerVmware';
import {
  vmwareProviderUser,
  vmwareTier1TestCephCold,
  vmwareTier1TestCephColdDuplicate,
  vmwareTier1TestCephWarm,
} from './tier1_config_vmware';
import {
  cleanUp,
  clickByText,
  createNamespace,
  login,
  provisionNetwork,
} from '../../../../utils/utils';
import { MappingNetwork } from '../../../models/mappingNetwork';
import { MappingStorage } from '../../../models/mappingStorage';
import { Plan } from '../../../models/plan';
import { button, SEC } from '../../../types/constants';

describe(
  `Tier1 test, creating VMWare provider, network and storage mappings, ` +
    `plan (${vmwareTier1TestCephCold.planData.name}), running plan and deleting at the end`,
  () => {
    const provider = new ProviderVmware();
    const networkMapping = new MappingNetwork();
    const storageMapping = new MappingStorage();
    const plan = new Plan();

    before('Creating namespace and provisioning NAD in it', () => {
      // Clearing all cookies in local storage if any
      cy.clearLocalStorageSnapshot();
      login(vmwareTier1TestCephCold.loginData);
      // Saving local storage state after login
      cy.saveLocalStorage();
      createNamespace(vmwareTier1TestCephCold.planData.namespace);
      provisionNetwork(vmwareTier1TestCephCold.planData.namespace);
    });

    beforeEach('Login to MTV', () => {
      // Restoring local storage and opening base MTV URL
      cy.restoreLocalStorage();
      cy.visit(vmwareTier1TestCephCold.loginData.url, { timeout: 120 * SEC });
      clickByText(button, 'Get started');
    });

    it('Create and edit VMWare provider', () => {
      provider.create(vmwareTier1TestCephCold.planData.providerData);
      provider.edit(vmwareProviderUser);
    });

    it('Create new network and storage mapping', () => {
      networkMapping.create(vmwareTier1TestCephCold.planData.networkMappingData);
      storageMapping.create(vmwareTier1TestCephCold.planData.storageMappingData);
    });

    it('Creating plan with existing network and storage mapping', () => {
      plan.create(vmwareTier1TestCephCold.planData);
    });

    it('Duplicating plan created in a previous tests', () => {
      plan.duplicate(vmwareTier1TestCephCold.planData, vmwareTier1TestCephColdDuplicate.planData);
    });

    it('Removing duplicated plan', () => {
      plan.delete(vmwareTier1TestCephColdDuplicate.planData);
    });

    it('Executing plan created in a previous tests', () => {
      plan.execute(vmwareTier1TestCephCold.planData);
    });

    it('Duplicating plan created in a previous tests', () => {
      plan.duplicate(vmwareTier1TestCephCold.planData, vmwareTier1TestCephColdDuplicate.planData);
    });

    it('Removing duplicated plan', () => {
      plan.delete(vmwareTier1TestCephColdDuplicate.planData);
    });

    it('Archive successfully migrated plan created in a previous tests', () => {
      plan.archive(vmwareTier1TestCephCold.planData);
    });

    it('Creating warm plan with existing network and storage mapping', () => {
      plan.create(vmwareTier1TestCephWarm.planData);
    });

    it('Executing warm plan created in a previous tests', () => {
      plan.execute(vmwareTier1TestCephWarm.planData);
    });

    after('Deleting VMs, plan, mappings and provider created in a previous tests', () => {
      cleanUp(vmwareTier1TestCephCold.planData);
    });
  }
);
