import { testData } from './config_separate_mapping';
import { Plan } from '../../models/plan';
import { login } from '../../../utils/utils';

describe('Creating plan', () => {
  const plan = new Plan();

  beforeEach(() => {
    login(testData.loginData);
  });

  it('Creating plan', () => {
    plan.create(testData.planData);
  });

  it.skip('Running plan', () => {
    plan.execute(testData.planData);
  });

  it.skip('Deleting plan', () => {
    plan.delete(testData.planData);
  });
});
