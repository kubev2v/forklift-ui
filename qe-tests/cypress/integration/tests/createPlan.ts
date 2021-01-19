import { testData } from './config';
import { Plan } from '../models/plan';
import { login } from '../../utils/utils';

describe('Creating plan', () => {
  it('Creating plan', () => {
    const plan = new Plan(testData.planData);
    login(testData.loginData);
    plan.create();
  });
});
