import * as React from 'react';
import { Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';
import { MappingType, Mapping } from '@app/queries/types';
import { useDeleteMappingMutation } from '@app/queries';

interface IMappingsActionsDropdownProps {
  mappingType: MappingType;
  mapping: Mapping;
}

const MappingsActionsDropdown: React.FunctionComponent<IMappingsActionsDropdownProps> = ({
  mappingType,
  mapping,
}: IMappingsActionsDropdownProps) => {
  const [kebabIsOpen, setKebabIsOpen] = React.useState(false);
  const [deleteMapping, deleteMappingResult] = useDeleteMappingMutation(mappingType);
  return (
    <Dropdown
      aria-label="Actions"
      toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
      isOpen={kebabIsOpen}
      isPlain
      dropdownItems={[
        <DropdownItem
          onClick={() => {
            setKebabIsOpen(false);
            alert('TODO');
          }}
          key="edit"
        >
          Edit
        </DropdownItem>,
        <DropdownItem
          onClick={() => {
            setKebabIsOpen(false);
            deleteMapping(mapping);
          }}
          isDisabled={deleteMappingResult.isLoading}
          key="remove"
        >
          Remove
        </DropdownItem>,
      ]}
      position={DropdownPosition.right}
    />
  );
};

export default MappingsActionsDropdown;
