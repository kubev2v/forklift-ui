import { Provider } from './provider';
import { click, inputText } from '../../utils/utils';
import { selectProvider } from '../views/provider.view';
import { ocpV, add } from '../types/constants';
import { ocpVData } from '../types/types';
import { addProvider, button, removeButton, selectProviderType, vmware } from '../types/constants';
import { applyAction, click } from '../../utils/utils';
import { ocpVData } from '../tests/config';

const ocpinstanceName = '#openshift-name';
const instanceUrl = '#openshift-url';
const instanceToken = '#openshift-sa-token';
const addButton = '#pf-modal-part-0 > footer > div > div > button.pf-c-button.pf-m-primary';
const ocpVMenu = '.pf-c-tabs__link';

export class ProviderocpV extends Provider {
  providerData: ocpVData;
  constructor(providerData: ocpVData) {
    this.providerData = providerData;
  }

  runWizard(): void {
    click(selectProvider, ocpV);
    inputText(ocpinstanceName, this.providerData.name);
    inputText(instanceUrl, this.providerData.Url);
    inputText(instanceToken, this.providerData.Token);
    click(addButton, add);
    click(ocpVMenu, ocpV);
    }

  create(): void {
    this.openMenu();
    this.runWizard();
  }

  delete(): void {
    click(ocpVMenu, ocpV);
    applyAction(providerData.name, removeButton);
  }
}
