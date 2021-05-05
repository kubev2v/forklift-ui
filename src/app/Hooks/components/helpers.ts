import { CLUSTER_API_VERSION, META } from '@app/common/constants';
import { IHook } from '@app/queries/types';
import React from 'react';
import { HookFormState } from './AddEditHookModal';

export const generateHook = (form: HookFormState): IHook => ({
  apiVersion: CLUSTER_API_VERSION,
  kind: 'Hook',
  metadata: {
    name: form.values.name,
    namespace: META.namespace,
  },
  spec: {
    url: form.values.url,
    branch: form.values.branch,
  },
});

interface IEditHookPrefillEffect {
  isDonePrefilling: boolean;
}

export const useEditHookPrefillEffect = (
  form: HookFormState,
  hookBeingEdited: IHook | null
): IEditHookPrefillEffect => {
  const [isStartedPrefilling, setIsStartedPrefilling] = React.useState(false);
  const [isDonePrefilling, setIsDonePrefilling] = React.useState(!hookBeingEdited);
  React.useEffect(() => {
    if (!isStartedPrefilling && hookBeingEdited) {
      setIsStartedPrefilling(true);
      const { fields } = form;

      fields.name.setInitialValue(hookBeingEdited.metadata.name);
      fields.url.setInitialValue(hookBeingEdited.spec.url);
      fields.branch.setInitialValue(hookBeingEdited.spec.branch);

      // Wait for effects to run based on field changes first
      window.setTimeout(() => {
        setIsDonePrefilling(true);
      }, 0);
    }
  }, [isStartedPrefilling, form, hookBeingEdited]);
  return { isDonePrefilling };
};
