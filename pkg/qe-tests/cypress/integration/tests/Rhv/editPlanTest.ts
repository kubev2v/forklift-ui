import { duplicateTestData, testData } from './config_separate_mapping_rhv';
import { Plan } from '../../models/plan';
import { login } from '../../../utils/utils';

describe('Creating plan', () => {
  const plan = new Plan();

  beforeEach(() => {
    login(testData.loginData);
  });

  it('Editing an existing plan', () => {
    plan.create(testData.planData);
    plan.edit(testData.planData, duplicateTestData.planData);
  });

  it('Deleting plan', () => {
    plan.delete(testData.planData);
  });
});
