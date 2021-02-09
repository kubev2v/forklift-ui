// import { OcpVirtData, ProviderData, VmwareProviderData } from '../types/types';
import { addProvider, button, removeButton, selectProviderType, vmware } from '../types/constants';
import { applyAction, clickByText, inputText, openSidebarMenu } from '../../utils/utils';
import { providerData } from '../tests/vmware/config';
import { instanceName, vmwareMenu } from '../views/providerVmware.view';
import { navMenuPoint } from '../views/menu.view';
import { ProviderData } from '../types/types';
import { selectProvider } from '../views/provider.view';

export class Provider {
  protected static openList() {
    openSidebarMenu();
    clickByText(navMenuPoint, 'Providers');
  }

  protected fillName(name: string) {
    inputText(instanceName, name);
  }
  protected openMenu(): void {
    //TODO: replace hardcoded timeout by expecting button to become clickable
    cy.wait(2000);
    Provider.openList();
  }

  protected runWizard(providerData: ProviderData): void {
    const { type } = providerData;
    clickByText(button, addProvider);
    clickByText(button, selectProviderType);
    clickByText(selectProvider, type);
  }

  // delete(): void {
  //   Provider.openList();
  // }
}
