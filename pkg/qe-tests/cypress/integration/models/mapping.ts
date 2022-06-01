import { MappingData, MappingPeer } from '../types/types';
import * as view from '../views/mapping.view';
import {
  applyAction,
  clickByText,
  inputText,
  openSidebarMenu,
  selectFromDroplist,
} from '../../utils/utils';
import {
  button,
  selectSource,
  selectTarget,
  create,
  mappings,
  createMapping,
  deleteButton,
  editButton,
  saveButton,
  trTag,
  SEC,
  addButton,
} from '../types/constants';
import {
  buttonNavLink,
  buttonModal,
  inputAttr,
  dataLabel,
  selectSourceProviderMenu,
  selectTargetProviderMenu,
} from '../views/mapping.view';

export class Mapping {
  protected selectSourceProvider(providerName: string): void {
    selectFromDroplist(selectSourceProviderMenu, providerName);
  }

  protected selectTargetProvider(providerName: string): void {
    selectFromDroplist(selectTargetProviderMenu, providerName);
  }

  protected selectInputByAttr(
    inputAttrName: string,
    inputAttrValue: string,
    inputStr: string
  ): void {
    const selector = `[${inputAttrName}="${inputAttrValue}"]`;
    inputText(selector, inputStr);
    clickByText(button, inputStr);
  }

  protected selectSource(sProvider: string): void {
    this.selectInputByAttr(inputAttr, selectSource, sProvider);
  }

  protected selectDestination(dProvider: string): void {
    this.selectInputByAttr(inputAttr, selectTarget, dProvider);
  }

  protected openMenu(): void {
    // Checking if sidebar is collapsed and opening it if required
    openSidebarMenu();

    clickByText(buttonNavLink, mappings);
  }

  protected createMappingPeer(mappingPeer: MappingPeer[]): void {
    let len = mappingPeer.length;
    mappingPeer.forEach((currentPeer) => {
      const { sProvider, dProvider } = currentPeer;
      this.selectSource(sProvider);
      this.selectDestination(dProvider);
      len -= 1;
      if (len > 0) {
        clickByText(button, addButton);
      }
    });
  }

  protected edit(mappingData: MappingData): void {
    const { name, mappingPeer, sProviderName, tProviderName } = mappingData;
    applyAction(name, editButton);
    this.selectSourceProvider(sProviderName);
    this.selectTargetProvider(tProviderName);
    this.createMappingPeer(mappingPeer);
    clickByText(buttonModal, saveButton);
  }

  protected inputName(name: string): void {
    inputText(view.mappingName, name);
  }

  protected createDialog(mappingData: MappingData): void {
    const { name, mappingPeer, sProviderName, tProviderName } = mappingData;
    cy.wait(2 * SEC);
    clickByText(button, createMapping);
    this.inputName(name);
    this.selectSourceProvider(sProviderName);
    this.selectTargetProvider(tProviderName);
    this.createMappingPeer(mappingPeer);
    // cy.wait(2000);
    clickByText(buttonModal, create);
    this.validateReady(mappingData);
  }

  protected validateReady(mappingData: MappingData): void {
    const { name } = mappingData;
    cy.contains(name, { timeout: 120 * SEC })
      .parent(trTag)
      .within(() => {
        cy.get(dataLabel.status, { timeout: 600 * SEC }).should('contain.text', 'OK');
      });
  }

  delete(mappingData: MappingData): void {
    const { name } = mappingData;
    applyAction(name, deleteButton);
    clickByText(button, deleteButton); //Added confirm button
  }
}
