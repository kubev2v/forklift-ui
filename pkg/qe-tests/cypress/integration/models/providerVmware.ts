import { Provider } from './provider';
import { applyAction, clickByText, click, inputText } from '../../utils/utils';
import {
  editButton,
  removeButton,
  saveButton,
  SEC,
  trTag,
  vmware,
  button,
} from '../types/constants';
import {
  addButtonModal,
  instanceName,
  instanceFingerprint,
  instanceHostname,
  instancePassword,
  instanceUsername,
  dataLabel,
} from '../views/providerVmware.view';
import { providerMenu } from '../views/provider.view';
import { VmwareProviderData } from '../types/types';

export class ProviderVmware extends Provider {
  protected fillName(name: string): void {
    inputText(instanceName, name);
  }

  protected fillHostname(hostname: string): void {
    inputText(instanceHostname, hostname);
  }

  protected fillUsername(username: string): void {
    inputText(instanceUsername, username);
  }

  protected fillPassword(password: string): void {
    inputText(instancePassword, password);
  }

  protected fillFingerprint(cert: string): void {
    inputText(instanceFingerprint, cert);
  }

  protected static openList(): void {
    super.openList();
    clickByText(providerMenu, vmware);
  }

  protected runWizard(providerData: VmwareProviderData): void {
    const { name, hostname, username, password, cert } = providerData;
    super.runWizard(providerData);
    this.fillName(name);
    this.fillHostname(hostname);
    this.fillUsername(username);
    this.fillPassword(password);
    this.fillFingerprint(cert);
    click(addButtonModal);
  }

  protected populate(providerData: VmwareProviderData): void {
    ProviderVmware.openList();
    const { name, hostname } = providerData;
    cy.contains(name)
      .parent(trTag)
      .within(() => {
        // Validating that provider is in `Ready` state
        cy.get(dataLabel.status, { timeout: 600 * SEC }).should('have.text', 'Ready');
        // Validating that endpoint is in proper format and contains proper URL
        cy.get(dataLabel.endpoint).should('contain.text', `https://${hostname}/sdk`);
        // Validating that amount of clusters is not empty and is not 0
        cy.get(dataLabel.clusters).should('not.be.empty').should('not.contain.text', '0');
        // Validating that amount of hosts is not empty and is not 0
        cy.get(dataLabel.hosts).should('not.be.empty').should('not.contain.text', '0');
        // Validating that amount of VMs is not empty and is not 0
        cy.get(dataLabel.vms).should('not.be.empty');
        // Validating that amount of networks is not empty and is not 0
        cy.get(dataLabel.networks).should('not.be.empty').should('not.contain.text', '0');
        // Validating that amount of datastores is not empty and is not 0
        cy.get(dataLabel.datastors).should('not.be.empty').should('not.contain.text', '0');
      });
  }

  delete(providerData: VmwareProviderData): void {
    const { name } = providerData;
    ProviderVmware.openList();
    applyAction(name, removeButton);
    clickByText(button, removeButton); //confirm Button
  }

  create(providerData: VmwareProviderData): void {
    super.openMenu();
    this.runWizard(providerData);
    this.populate(providerData);
  }

  edit(providerData: VmwareProviderData): void {
    const { name, hostname, username, password, cert } = providerData;
    ProviderVmware.openList();
    applyAction(name, editButton);
    this.fillHostname(hostname);
    this.fillUsername(username);
    this.fillPassword(password);
    this.fillFingerprint(cert);
    clickByText(addButtonModal, saveButton);
    this.populate(providerData);
  }
}
