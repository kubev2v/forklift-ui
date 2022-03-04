import { login } from '../../utils/utils';
import { testData } from '../tests/vmware/config_separate_mapping';

beforeEach(() => {
  login(testData.loginData);
});
it('run the first script', () => {
  cy.exec(`/bin/sh cypress/integration/rootCA/publish-rout-root-ca.sh`);
});

it('revert test', () => {
  cy.exec(`/bin/sh cypress/integration/rootCA/revert-rout-root-ca.sh`);
});
