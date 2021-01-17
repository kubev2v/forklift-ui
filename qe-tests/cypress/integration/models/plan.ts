import { PlanData } from '../types/types';
import { click, inputText, openSidebarMenu } from '../../utils/utils';
import { navMigrationPlan } from '../views/menu.view';
import { button, createPlan, migrationPLan } from '../types/constants';
import { planName } from '../views/plan.view';

export class Plan {
  planData: PlanData;
  constructor(planData: PlanData) {
    this.planData = planData;
  }

  openPlanList(): void {
    openSidebarMenu();
    click(navMigrationPlan, migrationPLan);
  }

  create(): void {
    this.openPlanList();
    click(button, createPlan);
    inputText(planName, this.planData.name);
  }
}
