import { testData } from './config';
import { login } from '../../utils/utils';
import { ProviderVmware } from '../models/providerVmware';
// import { MappingNetwork } from '../models/mappingNetwork';

describe('Login to MTV', () => {
  it.skip('Login to MTV', () => {
    login(testData.loginData);
  });
});

describe('Creating provider and deleting', () => {
  const provider = new ProviderVmware(testData.planData.providerData);
  it('Login to MTV and create provider', () => {
    login(testData.loginData);
    // const provider = new ProviderVmware(testData.providerData)
    provider.create();
  });

  it('Login to MTV, find and delete provider', () => {
    login(testData.loginData);
    provider.delete();
  });
});
