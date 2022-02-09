import { loginData, tData } from './ocpVirtConfig';
import { login } from '../../../utils/utils';
import { ProviderocpV } from '../../models/providerocpV';
import { OcpVirtData } from '../../types/types';
import { Plan } from '../../models/plan';

describe('Selecting Migration network and deleting', () => {
  const provider = new ProviderocpV();
  const providerData: OcpVirtData = tData.planData.providerData;
  const plan = new Plan();

  beforeEach(() => {
    login(loginData);
  });

  it('Login to MTV and create provider and create plan', () => {
    provider.create(providerData);
    plan.create(tData.planData);
  });

  it.skip('Login to MTV, find and delete provider, plan', () => {
    provider.delete(providerData);
    plan.delete(tData.planData);
  });
});
