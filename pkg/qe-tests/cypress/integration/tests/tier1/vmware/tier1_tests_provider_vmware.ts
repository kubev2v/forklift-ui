import { ProviderVmware } from '../../../models/providerVmware';
import { getStarted, login } from '../../../../utils/utils';
import { testData } from '../../vmware/config_separate_mapping';
import { vmwareProviderAdmin, vmwareProviderUser } from './tier1_config_vmware';
import { SEC } from '../../../types/constants';

describe('Tier1 tests for testing provider', () => {
  const provider = new ProviderVmware();
  before('Login to MTV', () => {
    // Clearing all cookies in local storage if any
    cy.clearLocalStorageSnapshot();
    login(testData.loginData);
    // Saving local storage state after login
    cy.saveLocalStorage();
  });

  beforeEach('Login to MTV', () => {
    // Restoring local storage and opening base MTV URL
    cy.restoreLocalStorage();
    cy.visit(testData.loginData.url, { timeout: 120 * SEC });
    getStarted();
  });

  it('Creating and editing provider', () => {
    provider.create(vmwareProviderAdmin);
    provider.edit(vmwareProviderUser);
  });

  it('Duplicate provider creation, negative test', () => {
    provider.createDuplicate(vmwareProviderUser);
  });

  after('Cleaning up', () => {
    provider.delete(vmwareProviderUser);
  });
});
