import { MappingData } from '../types/types';
import * as view from '../views/mapping.view';
import { applyAction, click, inputText, openSidebarMenu } from '../../utils/utils';
import {
  button,
  selectSource,
  selectTarget,
  sProvider,
  tProvider,
  create,
  mappings,
  createMapping,
  deleteButton,
} from '../types/constants';
import { buttonNavLink, buttonModal, inputAttr } from '../views/mapping.view';

export class Mapping {
  mappingData: MappingData;

  constructor(mappingData: MappingData) {
    this.mappingData = mappingData;
  }

  selectProvider(provider: string, providerName: string): void {
    click(button, provider);
    click(button, providerName);
  }

  selectInputByAttr(inputAttrName: string, inputAttrValue: string, inputStr: string): void {
    const selector = '[' + inputAttrName + '="' + inputAttrValue + '"]';
    inputText(selector, inputStr);
    click(button, inputStr);
  }

  openMenu(): void {
    // Checking if sidebar is collapsed and opening it if required
    openSidebarMenu();

    // Expanding sidebar mapping menu
    cy.get(buttonNavLink).then(($mappings) => {
      if ($mappings.attr('aria-expanded') == 'false') {
        click(buttonNavLink, mappings);
      }
    });
  }

  createDialog(): void {
    click(button, createMapping);
    inputText(view.mappingName, this.mappingData.name);
    this.selectProvider(sProvider, this.mappingData.sProviderName);
    this.selectProvider(tProvider, this.mappingData.tProviderName);
    this.selectInputByAttr(inputAttr, selectSource, this.mappingData.sProvider);
    this.selectInputByAttr(inputAttr, selectTarget, this.mappingData.dProvider);
    cy.wait(2000);
    click(buttonModal, create);
  }

  delete(): void {
    applyAction(this.mappingData.name, deleteButton);
  }
}
