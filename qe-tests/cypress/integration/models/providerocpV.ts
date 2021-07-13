import { Provider } from './provider';
import { applyAction, clickByText, inputText } from '../../utils/utils';
import { addButton, removeButton, trTag, SEC } from '../types/constants';
import { OcpVirtData } from '../types/types';
import {
  ocpinstanceName,
  instanceUrl,
  instanceToken,
  // addButtonModal,
  ocpVMenu,
  dataLabel,
  addButtonModal,
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
        cy.get(dataLabel.networks).invoke('text').then(parseFloat).should('be.gt', 0);
        // Verifying that datastore field is not empty and count is not 0
        cy.get(dataLabel.datastores).invoke('text').then(parseFloat).should('be.gt', 0);
      });
  }

  delete(providerData: OcpVirtData): void {
    const { name, type } = providerData;
    Provider.openList();
    clickByText(ocpVMenu, type);
    applyAction(name, removeButton);
  }

  create(providerData: OcpVirtData): void {
    this.openMenu();
    this.runWizard(providerData);
    this.populate(providerData);
  }
}
