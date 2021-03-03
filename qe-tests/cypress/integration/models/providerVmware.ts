import { Provider } from './provider';
import { applyAction, clickByText, inputText } from '../../utils/utils';
import {
  addButton,
  editButton,
  removeButton,
  saveButton,
  SEC,
  trTag,
  vmware,
} from '../types/constants';
import {
  addButtonModal,
  instanceName,
  instanceFingerprint,
  instanceHostname,
  instancePassword,
  instanceUsername,
  vmwareMenu,
  dataLabel,
} from '../views/providerVmware.view';
import { VmwareProviderData } from '../types/types';

export class ProviderVmware extends Provider {
  protected fillname(name: string): void {
    inputText(instanceName, name);
  }
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
    clickByText(vmwareMenu, vmware);
  }

  protected runWizard(providerData: VmwareProviderData): void {
    const { name, hostname, username, password, cert } = providerData;
    super.runWizard(providerData);
    this.fillname(name);
    this.fillHostname(hostname);
    this.fillUsername(username);
    this.fillPassword(password);
    this.fillFingerprint(cert);
    clickByText(addButtonModal, addButton);
  }

  protected validateReady(providerData: VmwareProviderData): void {
    ProviderVmware.openList();
    const { name } = providerData;
    cy.contains(name)
      .parent(trTag)
      .within(() => {
        cy.get(dataLabel.status, { timeout: 600 * SEC }).should('have.text', 'Ready');
      });
  }

  delete(providerData: VmwareProviderData): void {
    const { name } = providerData;
    ProviderVmware.openList();
    applyAction(name, removeButton);
  }

  create(providerData: VmwareProviderData): void {
    super.openMenu();
    this.runWizard(providerData);
    this.validateReady(providerData);
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
    this.validateReady(providerData);
  }
}
