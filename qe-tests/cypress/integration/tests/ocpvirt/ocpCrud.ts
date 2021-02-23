import { loginData, tData } from './ocpVirtConfig';
import { login } from '../../../utils/utils';
import { ProviderocpV } from '../../models/providerocpV';
import { OcpVirtData } from '../../types/types';

describe('Creating provider and deleting', () => {
  const provider = new ProviderocpV();
  const providerData: OcpVirtData = tData.planData.providerData;

  beforeEach(() => {
    login(loginData);
  });

  it('Login to MTV and create provider', () => {
    provider.create(providerData);
  });

  it('Login to MTV, find and delete provider', () => {
    provider.delete(providerData);
  });
});
