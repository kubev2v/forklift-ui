import { LoginData, ProviderData } from '../../types/types';

const url = Cypress.env('url');
const user_login = 'kubeadmin';
const user_password = Cypress.env('pass');

export const loginData: LoginData = {
  username: user_login,
  password: user_password,
  url: url,
};

export const providerData: ProviderData = {
  type: 'OpenShift Virtualization',
  name: 'ocpVirtTest',
  url: '',
  saToken: '',
};
