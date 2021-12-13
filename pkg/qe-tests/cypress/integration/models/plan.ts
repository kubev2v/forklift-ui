import { PlanData, HookData } from '../types/types';
import {
  clickByText,
  click,
  inputText,
  next,
  openSidebarMenu,
  selectFromDroplist,
  applyAction,
  selectCheckBox,
  unSelectCheckBox,
  filterArray,
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
  hookType,
  restartButton,
  duplicateButton,
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
  selectHooks,
  ansibleId,
  imageId,
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
    selectCheckBox(selector); //Added selectCheckBox function
    next();
  }

  protected selectVm(planData: PlanData): void {
    const { vmList } = planData;
    const selector = `[aria-label="search button for search input"]`;
    vmList.forEach((name) => {
      inputText(searchInput, name);
      click(selector);
      cy.get(tdTag)
        .contains(name)
        .closest(trTag)
        .within(() => {
          selectCheckBox('input');
        });
    });
  }
  //Method to unselect VMs those are not needed
  protected unSelectVm(vmList: string[]): void {
    const selector = `[aria-label="search button for search input"]`;
    vmList.forEach((name) => {
      inputText(searchInput, name);
      click(selector);
      cy.get(tdTag)
        .contains(name)
        .closest(trTag)
        .within(() => {
          unSelectCheckBox('input');
        });
    });
    next();
  }
  protected vmSelectionStep(planData): void {
    this.filterVm(planData);
    this.selectVm(planData);
    next();
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
    //TODO:storageMappingStep should be refactored to fix workaround for duplicate function only
  }

  protected addHook(hook: HookData): void {
    let hookString: string;
    if (hook.ansiblePlaybook) {
      hookString = hook.ansiblePlaybook;
      inputText(ansibleId, hookString);
    } else {
      hookString = hook.image;
      inputText(imageId, hookString);
    }
    click('#modal-confirm-button');
  }

  protected hooksStep(planData: PlanData): void {
    const { preHook, postHook } = planData;
    if (preHook) {
      clickByText(button, 'Add');
      cy.log(preHook.ansiblePlaybook);
      selectFromDroplist(selectHooks, hookType.prehook);
      this.addHook(preHook);
    }
    if (postHook) {
      clickByText(button, 'Add');
      selectFromDroplist(selectHooks, hookType.posthook);
      this.addHook(postHook);
    }
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

  protected reviewHooks() {
    //TODO:Next Task to validate pre-post hooks
  }

  protected finalReviewStep(planData: PlanData): void {
    const { name, sProvider, tProvider, namespace } = planData;
    // const totalVmAmount = vmwareSourceVmList.length;
    this.reviewPlanName(name);
    this.reviewSourceProvider(sProvider);
    this.reviewTargetProvider(tProvider);
    this.reviewTargetNamespace(namespace);
    this.reviewHooks();
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
        cy.get(`div.pf-c-progress__description`).contains(planSuccessMessage, {
          timeout: 3600 * SEC,
        });
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
  protected cancel(planData: PlanData): void {
    const { vmList } = planData;
    const rowAmount = vmList.length;
    let i;
    cy.wait(30 * SEC);
    for (i = 0; i < rowAmount; i++) {
      cy.get(`[aria-label="Select row ${i}"]`, { timeout: 30 * SEC })
        .should('be.enabled')
        .check();
    }
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
    this.hooksStep(planData);
    this.finalReviewStep(planData);
  }

  delete(planData: PlanData): void {
    const { name } = planData;
    Plan.openList();
    applyAction(name, deleteButton);
    clickByText(button, deleteButton); //Added Confirm Button
    cy.wait(2 * SEC);
  }

  execute(planData: PlanData): void {
    const { name, warmMigration } = planData;
    Plan.openList();
    this.run(name, 'Start');
    click('#modal-confirm-button');
    if (warmMigration) {
      Plan.openList();
      cy.wait(30 * SEC);
      this.run(name, 'Cutover');
      click('#modal-confirm-button');
      //TODO: Schedule cutover for later
    }
    this.waitForSuccess(name);
  }

  restart(planData: PlanData): void {
    const { name, warmMigration } = planData;
    Plan.openList();
    applyAction(name, restartButton);
    clickByText(button, 'Restart'); //Added Confirm Button
    if (warmMigration) {
      Plan.openList();
      cy.wait(30 * SEC);
      this.run(name, 'Cutover'); //Start Cutover now
      click('#modal-confirm-button');
      //TODO: Schedule cutover for later
    }
  }

  cancel_and_restart(planData: PlanData): void {
    const { name } = planData;
    Plan.openList();
    this.run(name, 'Start');
    click('#modal-confirm-button');
    cy.wait(10000);
    this.cancel(planData);
    this.waitForCanceled(name);
    this.restart(planData);
    cy.wait(10000);
    openSidebarMenu();
    clickByText(navMenuPoint, migrationPLan);
    this.waitForSuccess(name);
  }

  cancel_plan(planData: PlanData): void {
    const { name } = planData;
    Plan.openList();
    cy.wait(2000);
    this.run(name, 'Start');
    click('#modal-confirm-button');
    cy.wait(10000);
    this.cancel(planData);
    this.waitForCanceled(name);
  }

  duplicate(originalPlanData: PlanData, duplicatePlanData: PlanData): void {
    const { name } = originalPlanData;
    const vmListRemove = filterArray(originalPlanData.vmList, duplicatePlanData.vmList);
    Plan.openList();
    applyAction(name, duplicateButton);
    if (originalPlanData === duplicatePlanData) {
      cy.wait(2000);
      clickByText(button, 'Review');
      clickByText(button, finish);
    } else {
      this.generalStep(duplicatePlanData);
      this.filterVm(duplicatePlanData);
      this.selectVm(duplicatePlanData);
      this.unSelectVm(vmListRemove);
      this.networkMappingStep(duplicatePlanData);
      next();
      this.selectMigrationTypeStep(duplicatePlanData);
      this.hooksStep(duplicatePlanData);
      this.finalReviewStep(duplicatePlanData);
    }
  }
}
