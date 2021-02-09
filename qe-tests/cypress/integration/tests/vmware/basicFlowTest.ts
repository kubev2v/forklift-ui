import { testData } from './config';
import { login } from '../../../utils/utils';
import { ProviderVmware } from '../../models/providerVmware';
import { VmwareProviderData } from '../../types/types';

describe('Creating provider and deleting', () => {
  const provider = new ProviderVmware();
  const providerData: VmwareProviderData = testData.planData.providerData;

  beforeEach(() => {
    login(testData.loginData);
  });

  it('Login to MTV and create provider', () => {
    provider.create(providerData);
  });

  it.skip('Login to MTV, find and delete provider', () => {
    provider.delete(providerData);
  });
});
