import * as yup from 'yup';

import { useFormState, useFormField, IFormField } from '@app/common/hooks/useFormState';
import { ProviderType } from '@app/common/constants';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useOpenshiftFormState = (providerTypeField: IFormField<ProviderType | null>) => {
  return useFormState({
    providerType: providerTypeField,
    clusterName: useFormField('', yup.string().label('Cluster name').max(40).required()),
    url: useFormField('', yup.string().label('URL').max(40).required()),
    saToken: useFormField('', yup.string().label('Service account token').max(20).required()),
  });
};

export type OpenshiftFormState = ReturnType<typeof useOpenshiftFormState>; // ✨ Magic
