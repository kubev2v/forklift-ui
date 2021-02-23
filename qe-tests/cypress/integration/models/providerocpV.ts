import { Provider } from './provider';
import { applyAction, clickByText, inputText } from '../../utils/utils';
import { addButton, removeButton } from '../types/constants';
import { OcpVirtData } from '../types/types';
import {
  ocpinstanceName,
  instanceUrl,
  instanceToken,
  addButtonModal,
  ocpVMenu,
} from '../views/providerOcpV.view';

export class ProviderocpV extends Provider {
  protected fillocpname(name: string) {
    inputText(ocpinstanceName, name);
  }

  protected fillinstanceUrl(url: string) {
    inputText(instanceUrl, url);
  }

  protected filltoken(token: string) {
    inputText(instanceToken, token);
  }

  protected runWizard(providerData: OcpVirtData): void {
    const { name, url, saToken } = providerData;
    super.runWizard(providerData);
    this.fillocpname(name);
    this.fillinstanceUrl(url);
    this.filltoken(saToken);
    clickByText(addButtonModal, addButton);
    // clickByText(vmwareMenu, vmware);
  }

  delete(providerData: OcpVirtData) {
    const { name, type } = providerData;
    Provider.openList();
    clickByText(ocpVMenu, type);
    applyAction(name, removeButton);
  }

  create(providerData: OcpVirtData): void {
    this.openMenu();
    this.runWizard(providerData);
  }
}
