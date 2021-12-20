import { LoginData } from '../integration/types/types';
import * as loginView from '../integration/views/login.view';
import {
  button,
  finishButton,
  loginButton,
  nextButton,
  trTag,
} from '../integration/types/constants';
import { nav_toggle, page_sidebar, sidebar_collapsed } from '../integration/views/menu.view';
import { kebab, kebabDropDownItem } from '../integration/views/provider.view';
import { confirmButton } from '../integration/views/plan.view';

export function inputText(fieldId: string, text: string): void {
  cy.get(fieldId).last().clear().type(text);
}

export function clickByText(fieldId: string, buttonText: string): void {
  cy.contains(fieldId, buttonText).click();
}

export function click(fieldId: string): void {
  cy.get(fieldId).click();
}

export function login(loginData: LoginData): void {
  cy.visit(loginData.url);
  inputText(loginView.userNameInput, loginData.username);
  inputText(loginView.userPasswordInput, loginData.password);
  clickByText(button, loginButton);
  clickByText(button, 'Get started');
}

export function openSidebarMenu(): void {
  // Checking if sidebar is collapsed and opening it if required
  cy.get(page_sidebar).then(($sidebar) => {
    if ($sidebar.hasClass(sidebar_collapsed)) {
      click(nav_toggle);
    }
  });
}

export function applyAction(itemName: string, action: string): void {
  cy.contains(itemName)
    .closest(trTag)
    .within(() => {
      click(kebab);
    });
  clickByText(kebabDropDownItem, action);
  //Removed extra confirm button doesn't need for duplicate method
  //Added in restart and delete Method
}

export function selectFromDroplist(selector: string, point: string): void {
  click(selector);
  clickByText(button, point);
}

//function to select checkboxes
export function selectCheckBox(selector: string): void {
  cy.get(selector).then(($checkbox) => {
    if (!$checkbox.prop('checked')) {
      click(selector);
    }
  });
}

export function unSelectCheckBox(selector: string): void {
  cy.get(selector).then(($checkbox) => {
    if ($checkbox.prop('checked')) {
      click(selector);
    }
  });
}

//function to fiter array using two different config
export function filterArray(originalArray: string[], duplicateArray: string[]): string[] {
  return originalArray.filter((orig) => !duplicateArray.find((dup) => dup === orig));
}

export function confirm(): void {
  click(confirmButton);
}
export function finish(): void {
  clickByText(button, finishButton);
}
export function next(): void {
  clickByText(button, nextButton);
}
