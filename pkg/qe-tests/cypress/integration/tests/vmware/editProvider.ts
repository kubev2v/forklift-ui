import { incorrectProviderData, testData } from './config_separate_mapping';
import { login } from '../../../utils/utils';
import { ProviderVmware } from '../../models/providerVmware';
import { VmwareProviderData } from '../../types/types';

describe('Creating CRUD operation', () => {
  const provider = new ProviderVmware();
  const providerData: VmwareProviderData = testData.planData.providerData;

  beforeEach(() => {
    login(testData.loginData);
  });

  it('Create a RHV Provider and Edit the existing provider', () => {
    provider.edit(providerData, incorrectProviderData);
  });

  it('Login to MTV, find and delete provider', () => {
    provider.delete(providerData);
  });
});
