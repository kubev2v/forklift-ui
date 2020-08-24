import * as React from 'react';
import { Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';

const CNVProviderActionsDropdown: React.FunctionComponent = () => {
  const [kebabIsOpen, setKebabIsOpen] = React.useState(false);
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
            alert('TODO');
          }}
          key="remove"
        >
          Remove
        </DropdownItem>,
      ]}
      position={DropdownPosition.right}
    />
  );
};

export default CNVProviderActionsDropdown;
