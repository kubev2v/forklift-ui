import { Provider } from './provider';
import { applyAction, clickByText, inputText } from '../../utils/utils';
import { addButton, removeButton } from '../types/constants';
import {
  addButtonModal,
  instanceFingerprint,
  instanceHostname,
  instancePassword,
  instanceUsername,
  vmwareMenu,
} from '../views/providerVmware.view';
import { VmwareProviderData } from '../types/types';

export class ProviderVmware extends Provider {
  protected fillHostname(hostname: string) {
    inputText(instanceHostname, hostname);
  }

  protected fillUsername(username: string) {
    inputText(instanceUsername, username);
  }

  protected fillPassword(password: string) {
    inputText(instancePassword, password);
  }

  protected fillFingerprint(cert: string) {
    inputText(instanceFingerprint, cert);
  }

  protected runWizard(providerData: VmwareProviderData): void {
    const { name, hostname, username, password, cert } = providerData;
    super.runWizard(providerData);
    this.fillName(name);
    this.fillHostname(hostname);
    this.fillUsername(username);
    this.fillPassword(password);
    this.fillFingerprint(cert);
    clickByText(addButtonModal, addButton);
    // clickByText(vmwareMenu, vmware);
  }

  delete(providerData: VmwareProviderData) {
    const { name, type } = providerData;
    Provider.openList();
    clickByText(vmwareMenu, type);
    applyAction(name, removeButton);
  }

  create(providerData: VmwareProviderData): void {
    this.openMenu();
    this.runWizard(providerData);
  }
}
