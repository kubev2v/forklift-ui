import { Provider } from './provider';
import { RhvProviderData } from '../types/types';
import { applyAction, click, clickByText, inputText } from '../../utils/utils';
import {
  instanceCaCert,
  instanceHostname,
  instanceName,
  instancePassword,
  instanceUsername,
  addButtonModal,
  dataLabel,
} from '../views/providerRhv.view';
import { providerMenu } from '../views/provider.view';
import {
  removeButton,
  rhv,
  SEC,
  button,
  trTag,
  editButton,
  saveButton,
  incorrectRhvHostname,
} from '../types/constants';

export class providerRhv extends Provider {
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

  protected fillCaCert(caCert: string): void {
    inputText(instanceCaCert, caCert);
  }

  protected static openList(): void {
    super.openList();
    clickByText(providerMenu, rhv);
  }

  protected populate(providerData: RhvProviderData): void {
    providerRhv.openList();
    const { name, hostname } = providerData;
    cy.contains(name)
      .parent(trTag)
      .within(() => {
        if (hostname == incorrectRhvHostname) {
          cy.get(dataLabel.status, { timeout: 600 * SEC }).should('have.text', 'Critical');
        } else {
          // Validating that provider is in `Ready` state
          cy.get(dataLabel.status, { timeout: 600 * SEC }).should('have.text', 'Ready');
          // Validating that endpoint is in proper format and contains proper URL
          cy.get(dataLabel.endpoint).should('contain.text', `https://${hostname}/ovirt-engine/api`);
          // Validating that amount of clusters is not empty and is not 0
          cy.get(dataLabel.clusters).should('not.be.empty').should('not.contain.text', '0');
          // Validating that amount of hosts is not empty and is not 0
          cy.get(dataLabel.hosts).should('not.be.empty').should('not.contain.text', '0');
          // Validating that amount of VMs is not empty and is not 0
          cy.get(dataLabel.vms).should('not.be.empty');
          // Validating that amount of networks is not empty and is not 0
          cy.get(dataLabel.networks).should('not.be.empty').should('not.contain.text', '0');
          // Validating that amount of storageDomains is not empty and is not 0
          cy.get(dataLabel.storageDomains).should('not.be.empty').should('not.contain.text', '0');
        }
      });
  }
  protected runWizard(providerData: RhvProviderData): void {
    const { name, hostname, username, password, cert } = providerData;
    super.runWizard(providerData);
    this.fillName(name);
    this.fillHostname(hostname);
    this.fillUsername(username);
    this.fillPassword(password);
    this.fillCaCert(cert);
    click(addButtonModal);
    cy.wait(2 * SEC);
  }
  //Edit method RHV
  edit(providerData: RhvProviderData): void {
    const { name, hostname, username, password, cert } = providerData;
    providerRhv.openList();
    applyAction(name, editButton);
    this.fillHostname(hostname);
    this.fillUsername(username);
    this.fillPassword(password);
    this.fillCaCert(cert);
    clickByText(addButtonModal, saveButton);
    this.populate(providerData);
  }

  create(providerData: RhvProviderData): void {
    const { name, hostname, username, password, cert } = providerData;
    cy.wait(2 * SEC);
    super.runWizard(providerData);
    this.fillName(name);
    this.fillHostname(hostname);
    this.fillUsername(username);
    this.fillPassword(password);
    this.fillCaCert(cert);
    click(addButtonModal);
    this.populate(providerData);
  }

  delete(providerData: RhvProviderData): void {
    const { name } = providerData;
    providerRhv.openList();
    applyAction(name, removeButton);
    clickByText(button, removeButton); //Confirm Button
  }
}
