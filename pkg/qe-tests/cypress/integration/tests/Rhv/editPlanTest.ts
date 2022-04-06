import { duplicateTestData, testrhel8Cold } from './config_separate_mapping_rhv';
import { Plan } from '../../models/plan';
import { login } from '../../../utils/utils';

describe('Creating plan', () => {
  const plan = new Plan();

  beforeEach(() => {
    login(testrhel8Cold.loginData);
  });

  it('Editing an existing plan', () => {
    plan.create(testrhel8Cold.planData);
    plan.edit(testrhel8Cold.planData, duplicateTestData.planData);
  });

  it('Deleting plan', () => {
    plan.delete(testrhel8Cold.planData);
  });
});
