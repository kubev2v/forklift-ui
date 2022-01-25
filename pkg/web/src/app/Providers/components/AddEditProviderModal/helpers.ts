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
      fields.providerType.prefill(providerType);
      fields.name.prefill(providerBeingEdited.metadata.name);
      if (providerType === 'vsphere' || providerType === 'ovirt') {
        const sourceFields = fields as typeof forms.vsphere.fields | typeof forms.ovirt.fields;
        sourceFields.username.prefill(atob(secret?.data.user || ''));
        sourceFields.password.prefill(atob(secret?.data.password || ''));
      }
      if (providerType === 'ovirt') {
        const sourceFields = fields as typeof forms.ovirt.fields;
        sourceFields.caCert.prefill(atob(secret?.data.cacert || ''));
      }
      if (providerType === 'vsphere') {
        const vmwareFields = forms.vsphere.fields;
        vmwareFields.hostname.prefill(vmwareUrlToHostname(providerBeingEdited.spec.url || ''));
        vmwareFields.hostname.setIsTouched(true); // TODO this shouldn't be necessary once we resolve https://github.com/konveyor/lib-ui/issues/82
        vmwareFields.fingerprint.prefill(atob(secret?.data.thumbprint || ''));
      }
      if (providerType === 'ovirt') {
        const rhvFields = forms.ovirt.fields;
        rhvFields.hostname.prefill(ovirtUrlToHostname(providerBeingEdited.spec.url || ''));
      }
      if (providerType === 'openshift') {
        const openshiftFields = forms.openshift.fields;
        openshiftFields.url.prefill(providerBeingEdited.spec.url || '');
        openshiftFields.saToken.prefill(atob(secret?.data.token || ''));
      }
      // Wait for effects to run based on field changes first
      window.setTimeout(() => {
        setIsDonePrefilling(true);
      }, 0);
    }
  }, [isStartedPrefilling, providerBeingEdited, secretQuery.data, secretQuery.isSuccess, forms]);
  return { isDonePrefilling };
};
