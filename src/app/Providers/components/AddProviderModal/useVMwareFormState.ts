import * as yup from 'yup';

import { useFormState, useFormField, IFormField } from '@app/common/hooks/useFormState';
import { ProviderType } from '@app/common/constants';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useVMwareFormState = (providerTypeField: IFormField<ProviderType | null>) => {
  return useFormState({
    providerType: providerTypeField,
    name: useFormField('', yup.string().label('Name').min(2).max(20).required()),
    hostname: useFormField('', yup.string().label('Hostname').max(40).required()),
    username: useFormField('', yup.string().label('Username').max(20).required()),
    password: useFormField('', yup.string().label('Password').max(20).required()),
  });
};

export type VMwareFormState = ReturnType<typeof useVMwareFormState>; // ✨ Magic
