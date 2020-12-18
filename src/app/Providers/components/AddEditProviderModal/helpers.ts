import { useSecretQuery } from '@app/queries';
import * as React from 'react';
import { IProviderObject } from '@app/queries/types';
import { AddProviderFormState } from './AddEditProviderModal';
import { ProviderType } from '@app/common/constants';
import { vmwareUrlToHostname } from '@app/client/helpers';

interface IEditProviderPrefillEffect {
  isDonePrefilling: boolean;
}

export const useEditProviderPrefillEffect = (
  forms: AddProviderFormState,
  providerBeingEdited: IProviderObject | null
): IEditProviderPrefillEffect => {
  const [isDonePrefilling, setIsDonePrefilling] = React.useState(!providerBeingEdited);
  const secretQuery = useSecretQuery(providerBeingEdited?.spec.secret?.name);
  React.useEffect(() => {
    if (
      providerBeingEdited &&
      !forms.vsphere.isDirty &&
      !forms.openshift.isDirty &&
      secretQuery.isSuccess
    ) {
      const secret = secretQuery.data;
      if (providerBeingEdited.spec.type === ProviderType.vsphere) {
        const { fields } = forms.vsphere;
        fields.providerType.setValue(providerBeingEdited.spec.type);
        fields.providerType.setIsTouched(true);
        fields.name.setValue(providerBeingEdited.metadata.name);
        fields.name.setIsTouched(true);
        fields.hostname.setValue(vmwareUrlToHostname(providerBeingEdited.spec.url || ''));
        fields.hostname.setIsTouched(true);
        fields.username.setValue(atob(secret?.data.user || ''));
        fields.username.setIsTouched(true);
        fields.password.setValue(atob(secret?.data.password || ''));
        fields.fingerprint.setValue(atob(secret?.data.thumbprint || ''));
        fields.fingerprint.setIsTouched(true);
      } else if (providerBeingEdited.spec.type === ProviderType.openshift) {
        const { fields } = forms.openshift;
        fields.providerType.setValue(providerBeingEdited.spec.type);
        fields.providerType.setIsTouched(true);
        fields.name.setValue(providerBeingEdited.metadata.name);
        fields.name.setIsTouched(true);
        fields.url.setValue(providerBeingEdited.spec.url || '');
        fields.url.setIsTouched(true);
        fields.saToken.setValue(atob(secret?.data.token || ''));
        fields.saToken.setIsTouched(true);
      }
      // Wait for effects to run based on field changes first
      window.setTimeout(() => {
        setIsDonePrefilling(true);
      }, 0);
    }
  }, [forms, providerBeingEdited, secretQuery.data, secretQuery.isSuccess]);
  return { isDonePrefilling };
};
