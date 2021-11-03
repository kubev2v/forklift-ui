import { PlanData } from '../types/types';
import {
  clickByText,
  click,
  inputText,
  next,
  openSidebarMenu,
  selectFromDroplist,
  applyAction,
} from '../../utils/utils';
import { navMenuPoint } from '../views/menu.view';

import {
  button,
  createPlan,
  deleteButton,
  finish,
  migrationPLan,
  tdTag,
  trTag,
  SEC,
  planSuccessMessage,
  planCanceledMessage,
  CreateNewNetworkMapping,
} from '../types/constants';

import {
  dataLabel,
  mappingDropdown,
  planDescriptionInput,
  planNameInput,
  reviewName,
  reviewSourceProvider,
  reviewTargetProvider,
  reviewTargetNamespace,
  searchInput,
  selectDestProviderMenu,
  selectSourceProviderMenu,
  selectTargetNamespace,
  targetNetwork,
} from '../views/plan.view';

export class Plan {
  protected static openList(): void {
    openSidebarMenu();
    clickByText(navMenuPoint, migrationPLan);
  }
  protected fillName(name: string): void {
    inputText(planNameInput, name);
  }

  protected fillDescription(description: string): void {
    if (description) {
      inputText(planDescriptionInput, description);
    }
  }

  protected selectSourceProvider(sProvider: string): void {
    selectFromDroplist(selectSourceProviderMenu, sProvider);
  }

  protected selectTargetProvider(tProvider: string): void {
    selectFromDroplist(selectDestProviderMenu, tProvider);
  }

  protected selectNamespace(namespace: string): void {
    selectFromDroplist(selectTargetNamespace, namespace);
  }

  protected generalStep(planData: PlanData): void {
    const { name, description, sProvider, tProvider, namespace } = planData;
    this.fillName(name);
    this.fillDescription(description);
    this.selectSourceProvider(sProvider);
    this.selectTargetProvider(tProvider);
    this.selectNamespace(namespace);
    next();
  }

  protected filterVm(planData: PlanData): void {
    const { sourceClusterName } = planData;
    const selector = `[aria-label="Select Cluster ${sourceClusterName}"]`;
    click(selector);
    next();
  }

  protected selectVm(planData: PlanData): void {
    const { vmwareSourceVmList } = planData;
    const selector = `[aria-label="search button for search input"]`;
    vmwareSourceVmList.forEach((name) => {
      inputText(searchInput, name);
      click(selector);
      cy.get(tdTag)
        .contains(name)
        .closest(trTag)
        .within(() => {
          click('input');
        });
    });
    next();
  }

  protected vmSelectionStep(planData: PlanData): void {
    this.filterVm(planData);
    this.selectVm(planData);
  }

  protected networkMappingStep(planData: PlanData): void {
    const { useExistingNetworkMapping, networkMappingData } = planData;
    const { name, mappingPeer } = networkMappingData;
    if (useExistingNetworkMapping) {
      selectFromDroplist(mappingDropdown, name);
    } else {
      selectFromDroplist(mappingDropdown, CreateNewNetworkMapping);
      if (mappingPeer.length == 1) {
        selectFromDroplist(targetNetwork, mappingPeer[0].dProvider);
      } else {
        mappingPeer.forEach((peer) => {
          selectFromDroplist(targetNetwork, peer.dProvider);
        });
      }
    }

    next();
  }

  protected storageMappingStep(planData: PlanData): void {
    const { name } = planData.storageMappingData;
    const { useExistingStorageMapping } = planData;
    if (useExistingStorageMapping) {
      selectFromDroplist(mappingDropdown, name);
    }
    next();
  }

  protected hooksStep(): void {
    next();
  }

  protected validateSummaryLine(selector: string, value: string): void {
    cy.get(selector).should('have.text', value);
  }

  protected reviewPlanName(name: string): void {
    this.validateSummaryLine(reviewName, name);
  }

  protected reviewSourceProvider(sProvider: string): void {
    this.validateSummaryLine(reviewSourceProvider, sProvider);
  }

  protected reviewTargetProvider(tProvider: string): void {
    this.validateSummaryLine(reviewTargetProvider, tProvider);
  }

  protected reviewTargetNamespace(namespace: string): void {
    this.validateSummaryLine(reviewTargetNamespace, namespace);
  }

  protected finalReviewStep(planData: PlanData): void {
    const { name, sProvider, tProvider, namespace } = planData;
    // const totalVmAmount = vmwareSourceVmList.length;
    this.reviewPlanName(name);
    this.reviewSourceProvider(sProvider);
    this.reviewTargetProvider(tProvider);
    this.reviewTargetNamespace(namespace);
    clickByText(button, finish);
  }

  protected run(name: string, action: string): void {
    cy.get(tdTag)
      .contains(name)
      .closest(trTag)
      .within(() => {
        clickByText(button, action);
      });
  }

  protected waitForSuccess(name: string): void {
    cy.get(tdTag)
      .contains(name)
      .closest(trTag)
      .within(() => {
        cy.get(dataLabel.status).contains(planSuccessMessage, { timeout: 3600 * SEC });
      });
  }

  protected waitForCanceled(name: string): void {
    //Go to Migration plans list page
    Plan.openList();
    cy.get(tdTag)
      .contains(name)
      .parent(tdTag)
      .parent(trTag)
      .within(() => {
        cy.get(dataLabel.status).contains(planCanceledMessage, { timeout: 3600 * SEC });
      });
  }

  protected plan_details(name: string): void {
    cy.get(tdTag).contains(name).parent(tdTag).parent(trTag).click();
  }

  protected cancel(name: string): void {
    this.plan_details(name);
    cy.get(`[aria-label="Select row 0"]`, { timeout: 20000 }).should('be.enabled').check();
    clickByText(button, 'Cancel');
    clickByText(button, 'Yes, cancel');
  }

  protected selectMigrationTypeStep(planData: PlanData): void {
    const { warmMigration } = planData;
    if (!warmMigration) {
      click('[for="migration-type-cold"]');
    } else {
      click('[for="migration-type-warm"]');
    }
    next();
  }

  create(planData: PlanData): void {
    Plan.openList();
    clickByText(button, createPlan);
    this.generalStep(planData);
    this.vmSelectionStep(planData);
    this.networkMappingStep(planData);
    this.storageMappingStep(planData);
    this.selectMigrationTypeStep(planData);
    this.hooksStep();
    this.finalReviewStep(planData);
  }

  delete(planData: PlanData): void {
    const { name } = planData;
    Plan.openList();
    applyAction(name, deleteButton);
    cy.wait(2 * SEC);
  }

  execute(planData: PlanData): void {
    const { name, warmMigration } = planData;
    Plan.openList();
    this.run(name, 'Start');
    click('#modal-confirm-button');
    if (warmMigration) {
      Plan.openList();
      this.run(name, 'Cutover');
    }
    this.waitForSuccess(name);
  }

  restart(name: string): void {
    cy.get(tdTag)
      .contains(name)
      .parent(tdTag)
      .parent(trTag)
      .within(() => {
        clickByText(button, 'Restart');
      });
  }

  cancel_and_restart(planData: PlanData): void {
    const { name } = planData;
    Plan.openList();
    this.run(name, 'Start');
    this.cancel(name);
    this.waitForCanceled(name);
    this.restart(name);
    cy.wait(10000);
    openSidebarMenu();
    clickByText(navMenuPoint, migrationPLan);
    this.waitForSuccess(name);
  }
}
