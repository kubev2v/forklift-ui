import * as React from 'react';
import * as yup from 'yup';
import { Modal, Button, Form, Flex, Stack } from '@patternfly/react-core';
import { useFormState, useFormField, IFormField } from '@konveyor/lib-ui';

import { urlSchema } from '@app/common/constants';
import { usePausedPollingEffect } from '@app/common/context';
import {
  getHookNameSchema,
  useCreateHookMutation,
  usePatchHookMutation,
  useHooksQuery,
} from '@app/queries';

import { IHook } from '@app/queries/types';
import { QueryResult } from 'react-query';
import { QuerySpinnerMode, ResolvedQuery } from '@app/common/components/ResolvedQuery';
import { IKubeList } from '@app/client/types';
import { useEditHookPrefillEffect } from './helpers';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import HookDefinitionInputs from './HookDefinitionInputs';

export interface IHookDefinitionFields {
  name: IFormField<string>;
  url: IFormField<string>;
  branch: IFormField<string>;
}

export const useHookDefinitionFields = (
  clusterHooksQuery: QueryResult<IKubeList<IHook>>,
  hookBeingEdited: IHook | null
): IHookDefinitionFields => ({
  name: useFormField(
    '',
    getHookNameSchema(clusterHooksQuery, hookBeingEdited).label('Name').required()
  ),
  url: useFormField('', urlSchema.required()),
  branch: useFormField('', yup.string().required()),
});

const useHookDefinitionFormState = (
  clusterHooksQuery: QueryResult<IKubeList<IHook>>,
  hookBeingEdited: IHook | null
) => useFormState(useHookDefinitionFields(clusterHooksQuery, hookBeingEdited));

export type HookDefinitionFormState = ReturnType<typeof useHookDefinitionFormState>;

interface IAddEditHookModalProps {
  onClose: () => void;
  hookBeingEdited: IHook | null;
}

const AddEditHookModal: React.FunctionComponent<IAddEditHookModalProps> = ({
  onClose,
  hookBeingEdited,
}: IAddEditHookModalProps) => {
  usePausedPollingEffect();

  const hooksQuery = useHooksQuery();

  const hookForm = useHookDefinitionFormState(hooksQuery, hookBeingEdited);

  const { isDonePrefilling } = useEditHookPrefillEffect(hookForm, hookBeingEdited);

  const [createHook, createHookResult] = useCreateHookMutation();
  const [patchHook, patchHookResult] = usePatchHookMutation();
  const mutateHook = !hookBeingEdited ? createHook : patchHook;
  const mutateHookResult = !hookBeingEdited ? createHookResult : patchHookResult;

  return (
    <Modal
      className="AddEditHookModal"
      variant="small"
      title={`${!hookBeingEdited ? 'Create' : 'Edit'} hook`}
      isOpen
      onClose={onClose}
      footer={
        <Stack hasGutter>
          <ResolvedQuery
            result={mutateHookResult}
            errorTitle={`Error ${!hookBeingEdited ? 'creating' : 'editing'} hook`}
            spinnerMode={QuerySpinnerMode.Inline}
          />
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              id="modal-confirm-button"
              key="confirm"
              variant="primary"
              isDisabled={!hookForm.isDirty || !hookForm.isValid || mutateHookResult.isLoading}
              // TODO: To be addressed when hook backend is ready
              // onClick={() => {
              //   mutateHook(hookForm.values);
              // }}
            >
              {!hookBeingEdited ? 'Create' : 'Save'}
            </Button>
            <Button
              id="modal-cancel-button"
              key="cancel"
              variant="link"
              onClick={() => onClose()}
              isDisabled={mutateHookResult.isLoading}
            >
              Cancel
            </Button>
          </Flex>
        </Stack>
      }
    >
      <ResolvedQuery result={hooksQuery} errorTitle="Error loading hooks">
        {!isDonePrefilling ? (
          <LoadingEmptyState />
        ) : (
          <Form>
            <HookDefinitionInputs fields={hookForm.fields} hookBeingEdited={hookBeingEdited} />
          </Form>
        )}
      </ResolvedQuery>
    </Modal>
  );
};

export default AddEditHookModal;
