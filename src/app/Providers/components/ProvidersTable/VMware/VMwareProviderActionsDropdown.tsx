import * as React from 'react';
import { Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';

const VMwareProviderActionsDropdown: React.FunctionComponent = () => {
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
          key="TODO"
        >
          Some action
        </DropdownItem>,
      ]}
      position={DropdownPosition.right}
    />
  );
};

export default VMwareProviderActionsDropdown;
