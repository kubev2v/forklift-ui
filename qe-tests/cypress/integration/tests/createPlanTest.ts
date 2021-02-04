import { testData } from './config';
import { Plan } from '../models/plan';
import { login } from '../../utils/utils';

describe('Creating plan', () => {
  const plan = new Plan(testData.planData);

  beforeEach(() => {
    login(testData.loginData);
  });

  it.skip('Creating plan', () => {
    plan.create();
  });

  it('Running plan', () => {
    plan.start();
  });
});
