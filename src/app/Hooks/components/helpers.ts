import * as yup from 'yup';
import { CLUSTER_API_VERSION, META, urlSchema } from '@app/common/constants';
import { IHook } from '@app/queries/types';
import { IFormField, useFormField } from '@konveyor/lib-ui';
import React from 'react';
import { HookFormState } from './AddEditHookModal';
import { IKubeList } from '@app/client/types';
import { QueryResult } from 'react-query';
import { getHookNameSchema } from '@app/queries';

export type HookStep = 'PreHook' | 'PostHook';

export interface IHookDefinitionFields {
  name: IFormField<string>;
  url: IFormField<string>;
  branch: IFormField<string>;
}

export const useHookDefinitionFields = (
  hooksQuery: QueryResult<IKubeList<IHook>>,
  editingHookName: string | null,
  isNameRequired: boolean
): IHookDefinitionFields => {
  const nameSchema = getHookNameSchema(hooksQuery, editingHookName).label('Hook name');
  return {
    name: useFormField('', isNameRequired ? nameSchema.required() : nameSchema),
    url: useFormField('', urlSchema.required()),
    branch: useFormField('', yup.string().required()),
  };
};

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
