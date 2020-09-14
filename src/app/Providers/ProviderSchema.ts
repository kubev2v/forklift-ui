import * as yup from 'yup';

import { ProviderType } from '@app/common/constants';

const filter = new RegExp(ProviderType.vsphere + '|' + ProviderType.cnv);
const type = yup.string().matches(filter);
const name = yup.string().min(2).max(20);
const hostname = yup.string().max(40);
const username = yup.string().max(20);
const password = yup.string().max(20);
const token = yup.string().max(20);
const url = yup.string().max(40);

export const vmwareProviderSchema = yup.object().shape({
  providerType: type.required(),
  vmwareName: name.required('A name is min 2 and max 20'),
  vmwareHostName: hostname.required(),
  vmwareUsername: username.required(),
  vmwarePassword: password.required(),
});

export const cnvProviderSchema = yup.object().shape({
  providerType: yup.string().required(),
  cnvClusterName: name.required(),
  cnvUrl: url.required(),
  cnvSaToken: token.required(),
});
