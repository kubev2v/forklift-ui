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
  deleteButton,
  finish,
  migrationPLan,
  tdTag,
  trTag,
  SEC,
  planSuccessMessage,
  duplicateButton,
} from '../types/constants';

import {
  dataLabel,
  planDescriptionInput,
  planNameInput,
  reviewName,
  reviewSourceProvider,
  reviewTargetProvider,
  reviewTargetNamespace,
  selectDestProviderMenu,
  selectSourceProviderMenu,
  selectTargetNamespace,
} from '../views/plan.view';

export class Plan_duplicate {
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
    next();
  }

  protected filterVm(planData: PlanData): void {
    next();
  }

  protected selectVm(planData: PlanData): void {
    next();
  }

  protected vmSelectionStep(planData: PlanData): void {
    this.filterVm(planData);
    this.selectVm(planData);
  }

  protected networkMappingStep(planData: PlanData): void {
    next();
  }

  protected storageMappingStep(planData: PlanData): void {
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
    // this.reviewPlanName(name);
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
  protected plan_details(name: string): void {
    cy.get(tdTag).contains(name).parent(tdTag).parent(trTag).click();
  }

  protected selectMigrationTypeStep(planData: PlanData): void {
    next();
  }

  delete(planData: PlanData): void {
    const { name } = planData;
    Plan_duplicate.openList();
    applyAction(name, deleteButton);
    clickByText(button, deleteButton);
    cy.wait(2 * SEC);
  }

  execute(planData: PlanData): void {
    const { name, warmMigration } = planData;
    Plan_duplicate.openList();
    this.run(name, 'Start');
    click('#modal-confirm-button');
    if (warmMigration) {
      Plan_duplicate.openList();
      this.run(name, 'Cutover');
    }
    this.waitForSuccess(name);
  }

  duplicate(planData: PlanData): void {
    const { name } = planData;
    Plan_duplicate.openList();
    applyAction(name, duplicateButton);
    this.generalStep(planData);
    this.vmSelectionStep(planData);
    this.networkMappingStep(planData);
    this.storageMappingStep(planData);
    this.selectMigrationTypeStep(planData);
    this.hooksStep();
    this.finalReviewStep(planData);
  }
}
