import { incorrectProviderData, testData } from './config_separate_mapping_rhv';
import { login } from '../../../utils/utils';
import { providerRhv } from '../../models/providerRhv';
import { RhvProviderData } from '../../types/types';

describe('Creating CRUD operation', () => {
  const provider = new providerRhv();
  const providerData: RhvProviderData = testData.planData.providerData;

  beforeEach(() => {
    login(testData.loginData);
  });

  it('Create a RHV Provider and Edit existing provider', () => {
    provider.create(incorrectProviderData);
  });

  it('Create a RHV Provider and Edit existing provider', () => {
    provider.edit(providerData);
  });

  it('Login to MTV, find and delete provider', () => {
    provider.delete(providerData);
  });
});
