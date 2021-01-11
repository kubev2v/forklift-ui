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
  const [isStartedPrefilling, setIsStartedPrefilling] = React.useState(false);
  const [isDonePrefilling, setIsDonePrefilling] = React.useState(!providerBeingEdited);
  const secretQuery = useSecretQuery(providerBeingEdited?.spec.secret?.name || null);
  React.useEffect(() => {
    if (!isStartedPrefilling && providerBeingEdited && secretQuery.isSuccess) {
      setIsStartedPrefilling(true);
      const secret = secretQuery.data;
      if (providerBeingEdited.spec.type === ProviderType.vsphere) {
        const { fields } = forms.vsphere;
        fields.providerType.setInitialValue(providerBeingEdited.spec.type);
        fields.name.setInitialValue(providerBeingEdited.metadata.name);
        fields.hostname.setInitialValue(vmwareUrlToHostname(providerBeingEdited.spec.url || ''));
        fields.username.setInitialValue(atob(secret?.data.user || ''));
        fields.password.setInitialValue(atob(secret?.data.password || ''));
        fields.fingerprint.setInitialValue(atob(secret?.data.thumbprint || ''));
      } else if (providerBeingEdited.spec.type === ProviderType.openshift) {
        const { fields } = forms.openshift;
        fields.providerType.setInitialValue(providerBeingEdited.spec.type);
        fields.name.setInitialValue(providerBeingEdited.metadata.name);
        fields.url.setInitialValue(providerBeingEdited.spec.url || '');
        fields.saToken.setInitialValue(atob(secret?.data.token || ''));
      }
      // Wait for effects to run based on field changes first
      window.setTimeout(() => {
        setIsDonePrefilling(true);
      }, 0);
    }
  }, [
    isStartedPrefilling,
    forms.openshift,
    forms.vsphere,
    providerBeingEdited,
    secretQuery.data,
    secretQuery.isSuccess,
  ]);
  return { isDonePrefilling };
};
