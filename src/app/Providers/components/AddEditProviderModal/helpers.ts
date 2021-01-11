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
  const secretQuery = useSecretQuery(providerBeingEdited?.spec.secret?.name || null);
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
        fields.name.setValue(providerBeingEdited.metadata.name);
        fields.hostname.setValue(vmwareUrlToHostname(providerBeingEdited.spec.url || ''));
        fields.username.setValue(atob(secret?.data.user || ''));
        fields.password.setValue(atob(secret?.data.password || ''));
        fields.fingerprint.setValue(atob(secret?.data.thumbprint || ''));
      } else if (providerBeingEdited.spec.type === ProviderType.openshift) {
        const { fields } = forms.openshift;
        fields.providerType.setValue(providerBeingEdited.spec.type);
        fields.name.setValue(providerBeingEdited.metadata.name);
        fields.url.setValue(providerBeingEdited.spec.url || '');
        fields.saToken.setValue(atob(secret?.data.token || ''));
      }
      // Wait for effects to run based on field changes first
      window.setTimeout(() => {
        setIsDonePrefilling(true);
      }, 0);
    }
  }, [forms, providerBeingEdited, secretQuery.data, secretQuery.isSuccess]);
  return { isDonePrefilling };
};
