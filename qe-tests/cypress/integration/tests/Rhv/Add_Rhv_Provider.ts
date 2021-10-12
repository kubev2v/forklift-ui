import { testData } from './config_separate_mapping_rhv';
import { login } from '../../../utils/utils';
import { providerRhv } from '../../models/providerRhv';
import { RhvProviderData } from '../../types/types';

describe('Creating provider and deleting', () => {
  const provider = new providerRhv();
  const providerData: RhvProviderData = testData.planData.providerData;

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