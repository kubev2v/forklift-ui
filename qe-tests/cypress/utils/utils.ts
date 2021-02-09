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

export function inputText(fieldId: string, text: string): void {
  cy.get(fieldId).clear().type(text);
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
    .parent(trTag)
    .within(() => {
      click(kebab);
    });
  clickByText(kebabDropDownItem, action);
  clickByText(button, action);
}
export function selectFromDroplist(selector: string, point: string): void {
  click(selector);
  clickByText(button, point);
}

export function next(): void {
  clickByText(button, nextButton);
}
