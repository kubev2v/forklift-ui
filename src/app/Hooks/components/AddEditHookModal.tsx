import * as React from 'react';
import * as yup from 'yup';
import { Modal, Button, Form, Flex, Stack, Popover } from '@patternfly/react-core';
import { useFormState, useFormField, ValidatedTextInput } from '@konveyor/lib-ui';

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
import { HelpIcon } from '@patternfly/react-icons';
import { QuerySpinnerMode, ResolvedQuery } from '@app/common/components/ResolvedQuery';
import { IKubeList } from '@app/client/types';
import { useEditHookPrefillEffect } from './helpers';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';

interface IAddEditHookModalProps {
  onClose: () => void;
  hookBeingEdited: IHook | null;
}

const useHookFormState = (
  clusterHooksQuery: QueryResult<IKubeList<IHook>>,
  hookBeingEdited: IHook | null
) =>
  useFormState({
    name: useFormField(
      '',
      getHookNameSchema(clusterHooksQuery, hookBeingEdited).label('Name').required()
    ),
    url: useFormField('', urlSchema.required()),
    branch: useFormField('', yup.string().required()),
  });

export type HookFormState = ReturnType<typeof useHookFormState>;

const AddEditHookModal: React.FunctionComponent<IAddEditHookModalProps> = ({
  onClose,
  hookBeingEdited,
}: IAddEditHookModalProps) => {
  usePausedPollingEffect();

  const hooksQuery = useHooksQuery();

  const hookForm = useHookFormState(hooksQuery, hookBeingEdited);

  const { isDonePrefilling } = useEditHookPrefillEffect(hookForm, hookBeingEdited);

  const isFormValid = false;
  const isFormDirty = false;

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
              isDisabled={!isFormDirty || !isFormValid || mutateHookResult.isLoading}
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
            <ValidatedTextInput
              field={hookForm.fields.name}
              label="Hook name"
              isRequired
              fieldId="hook-name"
            />
            <ValidatedTextInput
              field={hookForm.fields.url}
              label="Git repository URL"
              isRequired
              fieldId="hook-url"
              inputProps={{
                isDisabled: !!hookBeingEdited,
              }}
              formGroupProps={{
                labelIcon: (
                  <Popover bodyContent="This is the Git repository where the Ansible playbook is located.">
                    <Button
                      variant="plain"
                      aria-label="More info for url field"
                      onClick={(e) => e.preventDefault()}
                      aria-describedby="hook-url-info"
                      className="pf-c-form__group-label-help"
                    >
                      <HelpIcon noVerticalAlign />
                    </Button>
                  </Popover>
                ),
              }}
            />
            <ValidatedTextInput
              field={hookForm.fields.branch}
              label="Branch"
              isRequired
              fieldId="hook-branch"
            />
          </Form>
        )}
      </ResolvedQuery>
    </Modal>
  );
};

export default AddEditHookModal;
