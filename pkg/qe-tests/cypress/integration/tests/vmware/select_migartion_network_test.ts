import { testData } from './config_separate_mapping';
import { login } from '../../../utils/utils';
import { ProviderVmware } from '../../models/providerVmware';
import { VmwareProviderData } from '../../types/types';

describe('Selecting Migration network and deleting', () => {
  const provider = new ProviderVmware();
  const providerData: VmwareProviderData = testData.planData.providerData;

  beforeEach(() => {
    login(testData.loginData);
  });

  it('create provider', () => {
    provider.create(providerData);
    provider.selectMigrationNetwork(providerData);
  });

  it('find and delete provider', () => {
    provider.delete(providerData);
  });
});
