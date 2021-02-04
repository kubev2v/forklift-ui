import { PlanData } from '../types/types';
import {
  applyAction,
  click,
  clickWithNoText,
  inputText,
  next,
  openSidebarMenu,
} from '../../utils/utils';
import { navMigrationPlan } from '../views/menu.view';

import {
  button,
  createPlan,
  deleteButton,
  migrationPLan,
  selectANetworkMapping,
  selectAStorageMapping,
  tdTag,
  trTag,
} from '../types/constants';

import {
  planDescriptionInput,
  planNameInput,
  searchInput,
  selectDestProviderMenu,
  selectSourceProviderMenu,
  selectTargetNamespace,
} from '../views/plan.view';

export class Plan {
  planData: PlanData;
  constructor(planData: PlanData) {
    this.planData = planData;
  }

  private static openList(): void {
    openSidebarMenu();
    click(navMigrationPlan, migrationPLan);
  }

  private generalStep(): void {
    inputText(planNameInput, this.planData.name);
    if (this.planData.description) {
      inputText(planDescriptionInput, this.planData.description);
    }
    clickWithNoText(selectSourceProviderMenu);
    click(button, this.planData.sProvider);
    clickWithNoText(selectDestProviderMenu);
    click(button, this.planData.tProvider);
    clickWithNoText(selectTargetNamespace);
    click(button, this.planData.namespace);
    next();
  }

  private vmSelectionStep(): void {
    this.filterVm();
    this.selectVm();
  }

  private filterVm(): void {
    const selector = '[aria-label="Select Host ' + this.planData.vmwareSourceFqdn + '"]';
    // cy.log(selector);
    clickWithNoText(selector);
    next();
  }

  private selectVm(): void {
    // const selector = '[area-label="search button for search input"]';
    const selector = 'button.pf-c-button.pf-m-control';
    this.planData.vmwareSourceVmList.forEach((name) => {
      inputText(searchInput, name);
      clickWithNoText(selector);
      cy.get(tdTag)
        .contains(name)
        .parent(trTag)
        .within(() => {
          clickWithNoText('input');
        });
    });
    next();
  }

  private networkMappingStep(): void {
    if (this.planData.useExistingNetworkMapping) {
      click(button, selectANetworkMapping);
      click(button, this.planData.networkMappingData.name);
    }
    next();
  }

  private storageMappingStep(): void {
    if (this.planData.useExistingStorageMapping) {
      click(button, selectAStorageMapping);
      click(button, this.planData.storageMappingData.name);
    }
    next();
  }

  private finalReviewStep(): void {
    click(button, 'Finish');
  }

  create(): void {
    Plan.openList();
    click(button, createPlan);
    this.generalStep();
    this.vmSelectionStep();
    this.networkMappingStep();
    this.storageMappingStep();
    this.finalReviewStep();
  }

  delete(): void {
    Plan.openList();
    applyAction(this.planData.name, deleteButton);
  }

  start(): void {
    Plan.openList();
    cy.get(tdTag)
      .contains(this.planData.name)
      .parent(tdTag)
      .parent(trTag)
      .within(() => {
        click(button, 'Start');
      });
    cy.get(tdTag)
      .contains(this.planData.name)
      .parent(tdTag)
      .parent(trTag)
      .within(() => {
        cy.contains('Succeeded', { timeout: 10000 });
      });
  }
}
