import { addProvider, button, selectProviderType } from '../types/constants';
import { clickByText, openSidebarMenu } from '../../utils/utils';
import { navMenuPoint } from '../views/menu.view';
import { ProviderData } from '../types/types';
import { selectProvider } from '../views/provider.view';

export class Provider {
  protected static openList(): void {
    openSidebarMenu();
    clickByText(navMenuPoint, 'Providers');
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
}
