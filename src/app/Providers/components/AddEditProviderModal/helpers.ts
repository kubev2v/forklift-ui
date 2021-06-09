import { useSecretQuery } from '@app/queries';
import * as React from 'react';
import { IProviderObject } from '@app/queries/types';
import { AddProviderFormState } from './AddEditProviderModal';
import { ovirtUrlToHostname, vmwareUrlToHostname } from '@app/client/helpers';

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
    if (
      !isStartedPrefilling &&
      providerBeingEdited &&
      secretQuery.isSuccess &&
      providerBeingEdited.spec.type
    ) {
      setIsStartedPrefilling(true);
      const secret = secretQuery.data;
      const providerType = providerBeingEdited.spec.type;
      const { fields } = forms[providerType];
      fields.providerType.setInitialValue(providerType);
      fields.name.setInitialValue(providerBeingEdited.metadata.name);
      if (providerType === 'vsphere' || providerType === 'ovirt') {
        const sourceFields = fields as typeof forms.vsphere.fields | typeof forms.ovirt.fields;
        sourceFields.username.setInitialValue(atob(secret?.data.user || ''));
        sourceFields.password.setInitialValue(atob(secret?.data.password || ''));
      }
      if (providerType === 'vsphere') {
        const vmwareFields = forms.vsphere.fields;
        vmwareFields.hostname.setInitialValue(
          vmwareUrlToHostname(providerBeingEdited.spec.url || '')
        );
        vmwareFields.fingerprint.setInitialValue(atob(secret?.data.thumbprint || ''));
      }
      if (providerType === 'ovirt') {
        const rhvFields = forms.ovirt.fields;
        rhvFields.hostname.setInitialValue(ovirtUrlToHostname(providerBeingEdited.spec.url || ''));
      }
      if (providerType === 'openshift') {
        const openshiftFields = forms.openshift.fields;
        openshiftFields.url.setInitialValue(providerBeingEdited.spec.url || '');
        openshiftFields.saToken.setInitialValue(atob(secret?.data.token || ''));
      }
      // Wait for effects to run based on field changes first
      window.setTimeout(() => {
        setIsDonePrefilling(true);
      }, 0);
    }
  }, [isStartedPrefilling, providerBeingEdited, secretQuery.data, secretQuery.isSuccess, forms]);
  return { isDonePrefilling };
};
