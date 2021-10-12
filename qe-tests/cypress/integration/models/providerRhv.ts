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
} from '../views/providerRhv.view';
import { providerMenu } from '../views/provider.view';
import { removeButton, rhv } from '../types/constants';

export class providerRhv extends Provider {
  protected runWizard(providerData: RhvProviderData): void {
    super.runWizard(providerData);
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

  protected fillCaCert(caCert: string): void {
    inputText(instanceCaCert, caCert);
  }

  protected static openList(): void {
    super.openList();
    clickByText(providerMenu, rhv);
  }

  create(providerData: RhvProviderData): void {
    const { name, hostname, username, password, cert } = providerData;
    super.runWizard(providerData);
    this.fillName(name);
    this.fillHostname(hostname);
    this.fillUsername(username);
    this.fillPassword(password);
    this.fillCaCert(cert);
    click(addButtonModal);
  }
  delete(providerData: RhvProviderData): void {
    const { name } = providerData;
    providerRhv.openList();
    applyAction(name, removeButton);
  }
}
