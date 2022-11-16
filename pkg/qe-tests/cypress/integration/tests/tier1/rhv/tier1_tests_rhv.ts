import {
  rhvProviderAdmin,
  rhvTier1TestCephCold,
  rhvTier1TestCephCold_duplicate,
  rhvTiesr1TestCephWarm,
} from './tier1_config_rhv';
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
import { ProviderRhv } from '../../../models/providerRhv';

describe(
  `Tier1 test, creating VMWare provider, network and storage mappings, ` +
    `plan (${rhvTier1TestCephCold.planData.name}), running plan and deleting at the end`,
  () => {
    const provider = new ProviderRhv();
    const networkMapping = new MappingNetwork();
    const storageMapping = new MappingStorage();
    const plan = new Plan();

    before('Creating namespace and provisioning NAD in it', () => {
      // Clearing all cookies in local storage if any
      cy.clearLocalStorageSnapshot();
      login(rhvTier1TestCephCold.loginData);
      // Saving local storage state after login
      cy.saveLocalStorage();
      createNamespace(rhvTier1TestCephCold.planData.namespace);
      provisionNetwork(rhvTier1TestCephCold.planData.namespace);
    });

    beforeEach('Login to MTV', () => {
      // Restoring local storage and opening base MTV URL
      cy.restoreLocalStorage();
      cy.visit(rhvTier1TestCephCold.loginData.url, { timeout: 120 * SEC });
      clickByText(button, 'Get started');
    });

    it('Create and edit RHV provider', () => {
      provider.create(rhvTier1TestCephCold.planData.providerData);
      provider.edit(rhvProviderAdmin);
    });

    it('Create new network and storage mapping', () => {
      networkMapping.create(rhvTier1TestCephCold.planData.networkMappingData);
      storageMapping.create(rhvTier1TestCephCold.planData.storageMappingData);
    });

    it('Creating plan with existing network and storage mapping', () => {
      plan.create(rhvTier1TestCephCold.planData);
    });

    it('Duplicating plan created in a previous tests', () => {
      plan.duplicate(rhvTier1TestCephCold.planData, rhvTier1TestCephCold_duplicate.planData);
    });

    it('Removing duplicated plan', () => {
      plan.delete(rhvTier1TestCephCold_duplicate.planData);
    });
    //
    it('Executing plan created in a previous tests', () => {
      plan.execute(rhvTier1TestCephCold.planData);
    });

    it('Duplicating plan created in a previous tests', () => {
      plan.duplicate(rhvTier1TestCephCold.planData, rhvTier1TestCephCold_duplicate.planData);
    });

    it('Removing duplicated plan', () => {
      plan.delete(rhvTier1TestCephCold_duplicate.planData);
    });

    it('Archive successfully migrated plan created in a previous tests', () => {
      plan.archive(rhvTier1TestCephCold.planData);
    });
    //
    it('Creating warm plan with existing network and storage mapping', () => {
      plan.create(rhvTier1TestCephCold.planData);
    });
    //
    it('Executing warm plan created in a previous tests', () => {
      plan.execute(rhvTiesr1TestCephWarm.planData);
      plan.delete(rhvTiesr1TestCephWarm.planData);
    });

    after('Deleting VMs, plan, mappings and provider created in a previous tests', () => {
      cleanUp(rhvTier1TestCephCold.planData);
    });
  }
);
