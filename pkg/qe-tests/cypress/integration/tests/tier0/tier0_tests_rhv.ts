import { rhvTier0TestArray } from './tier0_config_rhv';
import {
  cleanUp,
  clickByText,
  createNamespace,
  login,
  provisionNetwork,
} from '../../../utils/utils';
import { providerRhv } from '../../models/providerRhv';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';
import { Plan } from '../../models/plan';
import { button, SEC } from '../../types/constants';

rhvTier0TestArray.forEach((currentTest) => {
  describe(
    `Tier0 test, creating RHV provider, network and storage mappings, ` +
      `plan (${currentTest.planData.name}), running plan and deleting at the end`,
    () => {
      const provider = new providerRhv();
      const networkMapping = new MappingNetwork();
      const storageMapping = new MappingStorage();
      const plan = new Plan();

      before('Creating namespace and provisioning NAD in it', () => {
        // Clearing all cookies in local storage if any
        cy.clearLocalStorageSnapshot();
        login(currentTest.loginData);
        // Saving local storage state after login
        cy.saveLocalStorage();
        createNamespace(currentTest.planData.namespace);
        provisionNetwork(currentTest.planData.namespace);
      });

      beforeEach('Login to MTV', () => {
        // Restoring local storage and opening base MTV URL
        cy.restoreLocalStorage();
        cy.visit(currentTest.loginData.url, { timeout: 120 * SEC });
        clickByText(button, 'Get started');
      });

      it('Create new provider', () => {
        provider.create(currentTest.planData.providerData);
      });

      it('Create new network and storage mapping', () => {
        networkMapping.create(currentTest.planData.networkMappingData);
        storageMapping.create(currentTest.planData.storageMappingData);
      });

      it('Creating plan with existing network and storage mapping', () => {
        plan.create(currentTest.planData);
      });

      it('Running plan created in a previous tests', () => {
        plan.execute(currentTest.planData);
      });

      after('Deleting plan, mappings and provider created in a previous tests', () => {
        cleanUp(currentTest.planData);
      });
    }
  );
});
