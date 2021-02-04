import { testData } from './config';
import { login } from '../../utils/utils';
import { ProviderVmware } from '../models/providerVmware';

describe('Creating provider and deleting', () => {
  const provider = new ProviderVmware(testData.planData.providerData);

  beforeEach(() => {
    login(testData.loginData);
  });

  it('Login to MTV and create provider', () => {
    provider.create();
  });

  it.skip('Login to MTV, find and delete provider', () => {
    provider.delete();
  });
});
