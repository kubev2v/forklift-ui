import * as React from 'react';
import { Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';
import { MappingType, Mapping, IMetaObjectMeta } from '@app/queries/types';
import {
  useClusterProvidersQuery,
  useDeleteMappingMutation,
  useResourceQueriesForMapping,
} from '@app/queries';
import ConfirmModal from '@app/common/components/ConfirmModal';
import { areAssociatedProvidersReady } from '@app/queries/helpers';
import ConditionalTooltip from '@app/common/components/ConditionalTooltip';
import { isMappingValid } from './helpers';

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
  // const [deleteMapping, deleteMappingResult] = useDeleteMappingMutation(
  //   mappingType,
  //   toggleDeleteModal
  // );

  const deleteMappingMutationResult = useDeleteMappingMutation(mappingType, toggleDeleteModal);
  const { mutate: deleteMapping } = deleteMappingMutationResult;
  const clusterProvidersQuery = useClusterProvidersQuery();
  const areProvidersReady = React.useMemo(
    () => kebabIsOpen && areAssociatedProvidersReady(clusterProvidersQuery, mapping.spec.provider),
    [kebabIsOpen, clusterProvidersQuery, mapping.spec.provider]
  );
  const {
    availableSources,
    availableTargets,
    isLoading: isLoadingResourceQueries,
  } = useResourceQueriesForMapping(mappingType, mapping);
  const isValid = isMappingValid(mappingType, mapping, availableSources, availableTargets);
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
            isTooltipEnabled={!isLoadingResourceQueries && (!areProvidersReady || !isValid)}
            content={
              !areProvidersReady
                ? 'This mapping cannot be edited because the inventory data for its associated providers is not ready'
                : !isValid
                ? 'This mapping cannot be edited because it includes missing source or target resources. Delete and recreate the mapping.'
                : ''
            }
          >
            <DropdownItem
              onClick={() => {
                setKebabIsOpen(false);
                openEditMappingModal(mapping);
              }}
              key="edit"
              isDisabled={isLoadingResourceQueries || !areProvidersReady || !isValid}
            >
              Edit
            </DropdownItem>
          </ConditionalTooltip>,
          <DropdownItem
            onClick={() => {
              setKebabIsOpen(false);
              toggleDeleteModal();
            }}
            isDisabled={deleteMappingMutationResult.isLoading}
            key="delete"
          >
            Delete
          </DropdownItem>,
        ]}
        position={DropdownPosition.right}
      />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        toggleOpen={toggleDeleteModal}
        mutateFn={() => deleteMapping(mapping)}
        mutateResult={deleteMappingMutationResult}
        title={`Delete ${mappingType.toLowerCase()} mapping`}
        confirmButtonText="Delete"
        body={
          <>
            Are you sure you want to delete the {mappingType.toLowerCase()} mapping &quot;
            <strong>{(mapping.metadata as IMetaObjectMeta).name}</strong>&quot;?
          </>
        }
        errorText="Error deleting mapping"
      />
    </>
  );
};

export default MappingsActionsDropdown;
