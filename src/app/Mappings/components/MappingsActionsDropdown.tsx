import * as React from 'react';
import { Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';
import { MappingType, Mapping } from '@app/queries/types';
import { useDeleteMappingMutation } from '@app/queries';
import ConfirmDeleteModal from '@app/common/components/ConfirmDeleteModal';

interface IMappingsActionsDropdownProps {
  mappingType: MappingType;
  mapping: Mapping;
  openEditMappingModal: (mapping: Mapping) => void;
}

const MappingsActionsDropdown: React.FunctionComponent<IMappingsActionsDropdownProps> = ({
  mappingType,
  mapping,
  openEditMappingModal,
}: IMappingsActionsDropdownProps) => {
  const [kebabIsOpen, setKebabIsOpen] = React.useState(false);
  const [isDeleteModalOpen, toggleDeleteModal] = React.useReducer((isOpen) => !isOpen, false);
  const [deleteMapping, deleteMappingResult] = useDeleteMappingMutation(
    mappingType,
    toggleDeleteModal
  );
  return (
    <>
      <Dropdown
        aria-label="Actions"
        toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
        isOpen={kebabIsOpen}
        isPlain
        dropdownItems={[
          <DropdownItem
            onClick={() => {
              setKebabIsOpen(false);
              openEditMappingModal(mapping);
            }}
            key="edit"
          >
            Edit
          </DropdownItem>,
          <DropdownItem
            onClick={() => {
              setKebabIsOpen(false);
              toggleDeleteModal();
            }}
            isDisabled={deleteMappingResult.isLoading}
            key="delete"
          >
            Delete
          </DropdownItem>,
        ]}
        position={DropdownPosition.right}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        toggleOpen={toggleDeleteModal}
        deleteFn={() => deleteMapping(mapping)}
        deleteResult={deleteMappingResult}
        title={`Delete ${mappingType.toLowerCase()} mapping`}
        body={
          <>
            Are you sure you want to delete the {mappingType.toLowerCase()} mapping &quot;
            <strong>{mapping.metadata.name}</strong>&quot;?
          </>
        }
        errorText="Error deleting mapping"
      />
    </>
  );
};

export default MappingsActionsDropdown;
