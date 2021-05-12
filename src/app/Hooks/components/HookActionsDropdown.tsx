import * as React from 'react';
import { Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';

import { useDeleteHookMutation } from '@app/queries';
import { IHook, IMetaObjectMeta } from '@app/queries/types';
import ConfirmModal from '@app/common/components/ConfirmModal';

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

  return (
    <>
      <Dropdown
        aria-label="Actions"
        toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
        isOpen={kebabIsOpen}
        isPlain
        dropdownItems={[
          <DropdownItem
            key="edit"
            aria-label="Edit"
            onClick={() => {
              setKebabIsOpen(false);
              openEditHookModal(hook);
            }}
          >
            Edit
          </DropdownItem>,
          <DropdownItem
            key="remove"
            aria-label="Remove"
            onClick={() => {
              setKebabIsOpen(false);
              toggleDeleteModal();
            }}
            isDisabled={deleteHookResult.isLoading}
          >
            Remove
          </DropdownItem>,
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
            <strong>{(hook.metadata as IMetaObjectMeta).name}</strong>&quot;?
          </>
        }
        errorText="Error removing provider"
      />
    </>
  );
};

export default HookActionsDropdown;
