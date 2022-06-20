import { LoginData, PlanData } from '../integration/types/types';
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
  cy.get(fieldId, { timeout: 120 * SEC })
    .last()
    .clear()
    .type(text);
}

// Clicking on button with selection by text (when no other selector can be used)
export function clickByText(fieldId: string, buttonText: string): void {
  cy.contains(fieldId, buttonText, { timeout: 120 * SEC }).click();
}

// Clicking on object selected by fieldId
export function click(fieldId: string): void {
  cy.get(fieldId, { timeout: 120 * SEC }).click();
}

export function login(loginData: LoginData): void {
  cy.visit(loginData.url, { timeout: 120 * SEC });
  inputText(loginView.userNameInput, loginData.username);
  inputText(loginView.userPasswordInput, loginData.password);
  clickByText(button, loginButton);
  clickByText(button, 'Get started');
}

export function openSidebarMenu(): void {
  // Checking if sidebar is collapsed and opening it if required
  cy.get(page_sidebar, { timeout: 120 * SEC }).then(($sidebar) => {
    if ($sidebar.hasClass(sidebar_collapsed)) {
      click(nav_toggle);
    }
  });
}

export function applyAction(itemName: string, action: string): void {
  // itemName is text to be searched on the screen (like plan name, provider name, etc)
  // Action is the name of the action to be applied
  cy.contains(itemName, { timeout: 120 * SEC })
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
  cy.get(selector, { timeout: 120 * SEC }).then(($checkbox) => {
    if (!$checkbox.prop('checked')) {
      click(selector);
    }
  });
}

export function unSelectCheckBox(selector: string): void {
  cy.get(selector, { timeout: 120 * SEC }).then(($checkbox) => {
    if ($checkbox.prop('checked')) {
      click(selector);
    }
  });
}

//function to filter array using two different config
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

export function cleanVms(vm_list: string[], namespace: string): void {
  vm_list.forEach((vm) => {
    ocDelete(vm, 'vm', namespace);
  });
}

export function ocDelete(name, type, namespace?): void {
  let command: string;
  if (namespace) {
    command = `oc delete ${type} ${name} -n${namespace}`;
  } else {
    command = `oc delete ${type} ${name}`;
  }
  cy.exec(command, { failOnNonZeroExit: false }).then((output) => {
    cy.log(output.stdout);
    console.log(output.stdout);
  });
}

export function cleanUp(plan: PlanData): void {
  const { name, storageMappingData, networkMappingData, providerData, vmList, namespace } = plan;
  ocDelete(name, 'plan', 'openshift-mtv');
  ocDelete(storageMappingData.name, 'storagemap', 'openshift-mtv');
  ocDelete(networkMappingData.name, 'networkmap', 'openshift-mtv');
  ocDelete(providerData.name, 'provider', 'openshift-mtv');
  cleanVms(vmList, namespace);
  unprovisionNetwork(namespace);
  deleteNamespace(namespace);
}

export function ocApply(yaml, namespace: string): void {
  cy.exec(`oc project ${namespace}; cat <<EOF | oc apply -f - \n ${yaml} \nEOF`);
}

export function provisionNetwork(namespace: string): void {
  cy.exec(`oc project ${namespace}; sh second_network.sh`, { failOnNonZeroExit: false }).then(
    (output) => {
      cy.log(output.stdout);
      console.log(output.stdout);
    }
  );
}

export function unprovisionNetwork(namespace: string): void {
  ocDelete('mybridge', 'net-attach-def', namespace);
}

export function createNamespace(name: string): void {
  cy.exec(`oc create namespace ${name}`, { failOnNonZeroExit: false }).then((output) => {
    cy.log(output.stdout);
    console.log(output.stdout);
  });
}

export function deleteNamespace(name: string): void {
  ocDelete(name, 'namespace');
}
