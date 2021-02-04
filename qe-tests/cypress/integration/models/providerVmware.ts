import { Provider } from './provider';
import { click, inputText } from '../../utils/utils';
import { selectProvider } from '../views/provider.view';
import { vmware, addButton } from '../types/constants';
import {
  addButtonModal,
  instanceFingerprint,
  instanceHostname,
  instanceName,
  instancePassword,
  instanceUsername,
  vmwareMenu,
} from '../views/providerVmware.view';

export class ProviderVmware extends Provider {
  runWizard(): void {
    click(selectProvider, vmware);
    inputText(instanceName, this.providerData.name);
    inputText(instanceHostname, this.providerData.hostname);
    inputText(instanceUsername, this.providerData.username);
    inputText(instancePassword, this.providerData.password);
    inputText(instanceFingerprint, this.providerData.cert);
    click(addButtonModal, addButton);
    click(vmwareMenu, vmware);
  }

  create(): void {
    this.openMenu();
    this.runWizard();
  }
}
