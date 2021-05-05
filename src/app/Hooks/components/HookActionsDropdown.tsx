import * as React from 'react';
import { Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';

import { useDeleteHookMutation } from '@app/queries';
import { IHook } from '@app/queries/types';
import ConfirmModal from '@app/common/components/ConfirmModal';
import ConditionalTooltip from '@app/common/components/ConditionalTooltip';

interface IHookActionsDropdownProps {
  hook: IHook;
  openEditHookModal: (hook: IHook) => void;
}

const HookActionsDropdown: React.FunctionComponent<IHookActionsDropdownProps> = ({
  hook,
  openEditHookModal,
}: IHookActionsDropdownProps) => {
  const [kebabIsOpen, setKebabIsOpen] = React.useState(false);
  const [isDeleteModalOpen, toggleDeleteModal] = React.useReducer((isOpen) => !isOpen, false);
  const [deleteHook, deleteHookResult] = useDeleteHookMutation(toggleDeleteModal);

  // TODO: This is just a placeholder to be edited when backend for hooks is added
  const hasRunningMigration = false;
  const isEditDeleteDisabled = !hook.spec.url || hasRunningMigration;

  return (
    <>
      <Dropdown
        aria-label="Actions"
        toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
        isOpen={kebabIsOpen}
        isPlain
        dropdownItems={[
          <ConditionalTooltip
            key="edit"
            isTooltipEnabled={isEditDeleteDisabled}
            content={
              !hook.spec.url
                ? 'The hook cannot be edited'
                : hasRunningMigration
                ? 'This hook cannot be edited because it has running migrations'
                : ''
            }
          >
            <DropdownItem
              aria-label="Edit"
              onClick={() => {
                setKebabIsOpen(false);
                openEditHookModal(hook);
              }}
              isDisabled={isEditDeleteDisabled}
            >
              Edit
            </DropdownItem>
          </ConditionalTooltip>,
          <ConditionalTooltip
            key="delete"
            isTooltipEnabled={isEditDeleteDisabled}
            content={
              !hook.spec.url
                ? 'The hook cannot be deleted'
                : hasRunningMigration
                ? 'This hook cannot be removed because it has running migrations'
                : ''
            }
          >
            <DropdownItem
              aria-label="Remove"
              onClick={() => {
                setKebabIsOpen(false);
                toggleDeleteModal();
              }}
              isDisabled={deleteHookResult.isLoading || isEditDeleteDisabled}
            >
              Remove
            </DropdownItem>
          </ConditionalTooltip>,
        ]}
        position={DropdownPosition.right}
      />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        toggleOpen={toggleDeleteModal}
        mutateFn={() => deleteHook(hook)}
        mutateResult={deleteHookResult}
        title="Remove hook"
        confirmButtonText="Remove"
        body={
          <>
            Are you sure you want to remove hook &quot;
            <strong>{hook.metadata.name}</strong>&quot;?
          </>
        }
        errorText="Error removing provider"
      />
    </>
  );
};

export default HookActionsDropdown;
