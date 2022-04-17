import { testrhel8Cold } from './config_separate_mapping_rhv';
import { Plan } from '../../models/plan';
import { login } from '../../../utils/utils';

describe('Creating plan', () => {
  const plan = new Plan();

  beforeEach(() => {
    login(testrhel8Cold.loginData);
  });

  it('Creating plan', () => {
    plan.create(testrhel8Cold.planData);
  });

  it.skip('Running plan', () => {
    plan.execute(testrhel8Cold.planData);
  });

  it.skip('Deleting plan', () => {
    plan.delete(testrhel8Cold.planData);
  });
});
