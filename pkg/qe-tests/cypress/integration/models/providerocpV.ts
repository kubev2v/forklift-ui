import { Provider } from './provider';
import {
  applyAction,
  clickByText,
  inputText,
  selectCheckBox,
  selectFromDroplist,
  confirm,
} from '../../utils/utils';
import {
  addButton,
  removeButton,
  trTag,
  SEC,
  button,
  selectMigrationNetwork,
  tdTag,
} from '../types/constants';
import { OcpVirtData } from '../types/types';
import {
  ocpinstanceName,
  instanceUrl,
  instanceToken,
  // addButtonModal,
  ocpVMenu,
  dataLabel,
  addButtonModal,
  network,
} from '../views/providerOcpV.view';

export class ProviderocpV extends Provider {
  protected fillocpname(name: string): void {
    inputText(ocpinstanceName, name);
  }

  protected fillinstanceUrl(url: string): void {
    inputText(instanceUrl, url);
  }

  protected filltoken(token: string): void {
    inputText(instanceToken, token);
  }

  protected runWizard(providerData: OcpVirtData): void {
    const { name, url, saToken } = providerData;
    super.runWizard(providerData);
    this.fillocpname(name);
    this.fillinstanceUrl(url);
    this.filltoken(saToken);
    clickByText(addButtonModal, addButton);
  }

  protected populate(providerData: OcpVirtData): void {
    Provider.openList();
    const { name } = providerData;
    cy.contains(name)
      .parent(trTag)
      .within(() => {
        // Validating that provider is in `Ready` state
        cy.get(dataLabel.status, { timeout: 600 * SEC }).should('have.text', 'Ready');
        // Verifying that network field is not empty and count is not 0
        cy.get(dataLabel.networks, { timeout: 600 * SEC })
          .invoke('text')
          .then(parseFloat)
          .should('be.gt', 0);
        // Verifying that datastore field is not empty and count is not 0
        cy.get(dataLabel.datastores).should('not.be.empty').should('not.contain.text', '0');
      });
  }

  delete(providerData: OcpVirtData): void {
    const { name, type } = providerData;
    Provider.openList();
    clickByText(ocpVMenu, type);
    applyAction(name, removeButton);
    confirm();
  }

  create(providerData: OcpVirtData): void {
    const { migrationNetwork } = providerData;
    this.openMenu();
    this.runWizard(providerData);
    this.populate(providerData);
    if (migrationNetwork) {
      // To Select a non-default migration network
      this.selectProvider(providerData);
      clickByText(button, selectMigrationNetwork);
      this.selectDefaultNetwork(providerData);
    }
  }
  // To select checkbox of particular OCP Provider w.r.t name
  protected selectProvider(providerData: OcpVirtData): void {
    const { name } = providerData;
    cy.get(tdTag)
      .contains(name)
      .closest(trTag)
      .within(() => {
        selectCheckBox('input');
      });
  }
  // To check the default network is set to POD and then change to non-default target network
  protected selectDefaultNetwork(providerData: OcpVirtData): void {
    const { migrationNetwork } = providerData;
    cy.get(network).should('contain.text', 'Pod network'); //validate the network is set as default to 'POD Network'
    selectFromDroplist(network, migrationNetwork);
    confirm();
  }
}
