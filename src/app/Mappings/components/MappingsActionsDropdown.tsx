import * as React from 'react';
import { Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';
import { MappingType, Mapping } from '@app/queries/types';
import { useClusterProvidersQuery, useDeleteMappingMutation } from '@app/queries';
import ConfirmDeleteModal from '@app/common/components/ConfirmDeleteModal';
import { areAssociatedProvidersReady } from '@app/queries/helpers';
import ConditionalTooltip from '@app/common/components/ConditionalTooltip';

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
  const clusterProvidersQuery = useClusterProvidersQuery();
  const isEditDisabled = React.useMemo(
    () => kebabIsOpen && !areAssociatedProvidersReady(clusterProvidersQuery, mapping.spec.provider),
    [kebabIsOpen, clusterProvidersQuery, mapping.spec.provider]
  );
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
            isTooltipEnabled={isEditDisabled}
            content="This mapping cannot be edited because the inventory data for its associated providers is not ready"
          >
            <DropdownItem
              onClick={() => {
                setKebabIsOpen(false);
                openEditMappingModal(mapping);
              }}
              key="edit"
              isDisabled={isEditDisabled}
            >
              Edit
            </DropdownItem>
          </ConditionalTooltip>,
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
