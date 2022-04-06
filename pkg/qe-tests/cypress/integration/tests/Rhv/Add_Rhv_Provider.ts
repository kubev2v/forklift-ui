import { testrhel8Cold } from './config_separate_mapping_rhv';
import { login } from '../../../utils/utils';
import { providerRhv } from '../../models/providerRhv';
import { RhvProviderData } from '../../types/types';

describe('Creating provider and deleting', () => {
  const provider = new providerRhv();
  const providerData: RhvProviderData = testrhel8Cold.planData.providerData;

  beforeEach(() => {
    login(testrhel8Cold.loginData);
  });

  it('Login to MTV and create provider', () => {
    provider.create(providerData);
  });

  it.skip('Login to MTV, find and delete provider', () => {
    provider.delete(providerData);
  });
});
