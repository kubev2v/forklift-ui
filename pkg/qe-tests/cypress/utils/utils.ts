import { LoginData } from '../integration/types/types';
import * as loginView from '../integration/views/login.view';
import {
  button,
  finishButton,
  loginButton,
  nextButton,
  SEC,
  trTag,
} from '../integration/types/constants';
import { nav_toggle, page_sidebar, sidebar_collapsed } from '../integration/views/menu.view';
import { kebab, kebabDropDownItem } from '../integration/views/provider.view';
import { confirmButton } from '../integration/views/plan.view';

export function inputText(fieldId: string, text: string): void {
  cy.get(fieldId, { timeout: 30 * SEC })
    .last()
    .clear()
    .type(text);
}

// Clicking on button with selection by text (when no other selector can be used)
export function clickByText(fieldId: string, buttonText: string): void {
  cy.contains(fieldId, buttonText).click();
}

// Clicking on object selected by fieldId
export function click(fieldId: string): void {
  cy.get(fieldId, { timeout: 30 * SEC }).click();
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
  // itemName is text to be searched on the screen (like plan name, provider name, etc)
  // Action is the name of the action to be applied
  cy.contains(itemName)
    .closest(trTag)
    .within(() => {
      click(kebab);
    });
  clickByText(kebabDropDownItem, action);
}

export function selectFromDroplist(selector: string, point: string): void {
  click(selector);
  clickByText(button, point);
}

//function to select checkboxes
export function selectCheckBox(selector: string): void {
  cy.get(selector, { timeout: 60 * SEC }).then(($checkbox) => {
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

//Confirming action when required
export function confirm(): void {
  click(confirmButton);
}

// Pressing Finish button when required
export function finish(): void {
  clickByText(button, finishButton);
}

// Pressing Next button
export function next(): void {
  clickByText(button, nextButton);
}
// Pressing Cancel button
export function clickOnCancel(): void {
  clickByText(button, 'Cancel');
  clickByText(button, 'Yes, cancel');
}
