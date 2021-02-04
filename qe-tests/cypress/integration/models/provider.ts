import { ProviderData } from '../types/types';
import { addProvider, button, removeButton, selectProviderType, vmware } from '../types/constants';
import { applyAction, click } from '../../utils/utils';
import { providerData } from '../tests/config';
import { vmwareMenu } from '../views/providerVmware.view';

export class Provider {
  providerData: ProviderData;
  constructor(providerData: ProviderData) {
    this.providerData = providerData;
  }

  openMenu(): void {
    //TODO: replace hardcoded timeout by expecting button to become clickable
    cy.wait(3000);
    // cy.findAllByRole(button).findByText(addProvider).should('be.enabled').click();
    click(button, addProvider);
    click(button, selectProviderType);
  }

  delete(): void {
    click(vmwareMenu, vmware);
    applyAction(providerData.name, removeButton);
  }
}
