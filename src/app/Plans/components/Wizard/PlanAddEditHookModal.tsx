import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import { ResolvedQuery } from '@app/common/components/ResolvedQuery';
import { usePausedPollingEffect } from '@app/common/context';
import HookDefinitionInputs from '@app/Hooks/components/HookDefinitionInputs';
import { useHooksQuery } from '@app/queries';
import { IHook } from '@app/queries/types';
import { Modal, Stack, Flex, Button, Form } from '@patternfly/react-core';
import * as React from 'react';

interface IPlanAddEditHookModalProps {
  onClose: () => void;
  hookBeingEdited: IHook | null;
}

const PlanAddEditHookModal: React.FunctionComponent<IPlanAddEditHookModalProps> = ({
  onClose,
  hookBeingEdited,
}: IPlanAddEditHookModalProps) => {
  usePausedPollingEffect();

  const hooksQuery = useHooksQuery();

  // TODO useFormState here that is a superset of the useHookDefintionFormState? how does that fold into the plan wizard?
  const hookForm = {
    isDirty: false,
    isValid: false,
  };

  return (
    <Modal
      className="AddEditHookModal"
      variant="small"
      title={`${!hookBeingEdited ? 'Create' : 'Edit'} hook`}
      isOpen
      onClose={onClose}
      footer={
        <Stack hasGutter>
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              id="modal-confirm-button"
              key="confirm"
              variant="primary"
              isDisabled={!hookForm.isDirty || !hookForm.isValid}
              // TODO: To be addressed when hook backend is ready
              // onClick={() => {
              //   mutateHook(hookForm.values);
              // }}
            >
              {!hookBeingEdited ? 'Create' : 'Save'}
            </Button>
            <Button id="modal-cancel-button" key="cancel" variant="link" onClick={() => onClose()}>
              Cancel
            </Button>
          </Flex>
        </Stack>
      }
    >
      <ResolvedQuery result={hooksQuery} errorTitle="Error loading hooks">
        <h1>TODO</h1>
        {/*!isDonePrefilling ? (
          <LoadingEmptyState />
        ) : (
          <Form>
            <HookDefinitionInputs fields={hookForm.fields} hookBeingEdited={hookBeingEdited} />
          </Form>
        )*/}
      </ResolvedQuery>
    </Modal>
  );
};

export default PlanAddEditHookModal;
