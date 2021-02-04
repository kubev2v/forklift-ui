import { LoginData } from '../integration/types/types';
import * as loginView from '../integration/views/login.view';
import {
  button,
  // deleteButton,
  loginButton,
  nextButton,
  trTag,
} from '../integration/types/constants';
import { nav_toggle, page_sidebar, sidebar_collapsed } from '../integration/views/menu.view';
import { kebab, kebabDropDownItem } from '../integration/views/provider.view';

export function inputText(fieldId: string, text: string) {
  cy.get(fieldId).clear().type(text);
}

export function click(fieldId: string, buttonText: string) {
  cy.contains(fieldId, buttonText).click();
}

export function clickWithNoText(fieldId: string) {
  cy.get(fieldId).click();
}

export function login(loginData: LoginData) {
  cy.visit(loginData.url);
  inputText(loginView.userNameInput, loginData.username);
  inputText(loginView.userPasswordInput, loginData.password);
  click(button, loginButton);
  click(button, 'Get started');
}

export function openSidebarMenu() {
  // Checking if sidebar is collapsed and opening it if required
  cy.get(page_sidebar).then(($sidebar) => {
    if ($sidebar.hasClass(sidebar_collapsed)) {
      clickWithNoText(nav_toggle);
    }
  });
}

export function applyAction(itemName: string, action: string) {
  cy.contains(itemName)
    .parent(trTag)
    .within(() => {
      clickWithNoText(kebab);
    });
  click(kebabDropDownItem, action);
  click(button, action);
}

export function next(): void {
  click(button, nextButton);
}
