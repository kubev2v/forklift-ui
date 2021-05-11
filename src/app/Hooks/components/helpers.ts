import * as yup from 'yup';
import { CLUSTER_API_VERSION, META, urlSchema } from '@app/common/constants';
import { IHook, IMetaObjectMeta } from '@app/queries/types';
import { IFormField, useFormField } from '@konveyor/lib-ui';
import React from 'react';
import { HookFormState } from './AddEditHookModal';
import { IKubeList } from '@app/client/types';
import { QueryResult } from 'react-query';
import { getHookNameSchema } from '@app/queries';

export type HookStep = 'PreHook' | 'PostHook';

export interface IHookDefinitionFields {
  name: IFormField<string>;
  type: IFormField<'playbook' | 'image'>;
  playbook: IFormField<string>;
  image: IFormField<string>;
  serviceAccount: IFormField<string>;
}

export const useHookDefinitionFields = (
  hooksQuery: QueryResult<IKubeList<IHook>>,
  editingHookName: string | null,
  isNameRequired: boolean
): IHookDefinitionFields => {
  const nameSchema = getHookNameSchema(hooksQuery, editingHookName).label('Hook name');
  const type = useFormField('image', yup.mixed<'playbook' | 'image'>().required());
  return {
    name: useFormField('', isNameRequired ? nameSchema.required() : nameSchema),
    type,
    playbook: useFormField('', type.value === 'playbook' ? yup.string().required() : yup.string()),
    image: useFormField('', type.value === 'image' ? yup.string().required() : yup.string()),
    serviceAccount: useFormField('', yup.string()),
  };
};

export const generateHook = (values: HookFormState['values'], generateName: boolean): IHook => ({
  apiVersion: CLUSTER_API_VERSION,
  kind: 'Hook',
  metadata: {
    ...(generateName ? { generateName: `${values.name}-` } : { name: values.name }),
    namespace: META.namespace,
  },
  spec: {
    ...(values.type === 'playbook' ? { playbook: values.playbook || '' } : {}),
    ...(values.type === 'image' ? { image: values.image || '' } : {}),
    ...(values.serviceAccount ? { serviceAccount: values.serviceAccount } : {}),
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

      fields.name.setInitialValue((hookBeingEdited.metadata as IMetaObjectMeta).name);
      fields.playbook.setInitialValue(hookBeingEdited.spec.playbook || '');
      fields.image.setInitialValue(hookBeingEdited.spec.image || '');
      fields.serviceAccount.setInitialValue(hookBeingEdited.spec.serviceAccount || '');

      // Wait for effects to run based on field changes first
      window.setTimeout(() => {
        setIsDonePrefilling(true);
      }, 0);
    }
  }, [isStartedPrefilling, form, hookBeingEdited]);
  return { isDonePrefilling };
};
