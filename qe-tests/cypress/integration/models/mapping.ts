import { MappingData } from '../types/types';
import * as view from '../views/mapping.view';
import { applyAction, clickByText, inputText, openSidebarMenu } from '../../utils/utils';
import {
  button,
  selectSource,
  selectTarget,
  selectProvider,
  // tProvider,
  create,
  mappings,
  createMapping,
  deleteButton,
} from '../types/constants';
import { buttonNavLink, buttonModal, inputAttr } from '../views/mapping.view';

export class Mapping {
  // mappingData: MappingData;
  //
  // constructor(mappingData: MappingData) {
  //   this.mappingData = mappingData;
  // }

  selectProvider(providerName: string): void {
    clickByText(button, selectProvider);
    clickByText(button, providerName);
  }

  selectInputByAttr(inputAttrName: string, inputAttrValue: string, inputStr: string): void {
    // const selector = '[' + inputAttrName + '="' + inputAttrValue + '"]';
    const selector = `[${inputAttrName}="${inputAttrValue}"]`;
    inputText(selector, inputStr);
    clickByText(button, inputStr);
  }

  openMenu(): void {
    // Checking if sidebar is collapsed and opening it if required
    openSidebarMenu();

    // Expanding sidebar mapping menu
    cy.get(buttonNavLink).then(($mappings) => {
      if ($mappings.attr('aria-expanded') == 'false') {
        clickByText(buttonNavLink, mappings);
      }
    });
  }

  createDialog(mappingData: MappingData): void {
    const { name, sProvider, dProvider, sProviderName, tProviderName } = mappingData;
    clickByText(button, createMapping);
    inputText(view.mappingName, name);
    this.selectProvider(sProviderName);
    this.selectProvider(tProviderName);
    this.selectInputByAttr(inputAttr, selectSource, sProvider);
    this.selectInputByAttr(inputAttr, selectTarget, dProvider);
    cy.wait(2000);
    clickByText(buttonModal, create);
  }

  delete(mappingData: MappingData): void {
    const { name } = mappingData;
    applyAction(name, deleteButton);
  }
}
