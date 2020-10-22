import * as React from 'react';
import { Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';

import { IStatusCondition } from '@app/queries/types';
import { StatusConditionsType } from '@app/common/constants';
import { hasCondition } from '@app/common/helpers';

interface IPlansActionDropdownProps {
  conditions: IStatusCondition[];
}

const PlansActionsDropdown: React.FunctionComponent<IPlansActionDropdownProps> = ({
  conditions,
}: IPlansActionDropdownProps) => {
  const [kebabIsOpen, setKebabIsOpen] = React.useState(false);

  return (
    <Dropdown
      aria-label="Actions"
      toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
      isOpen={kebabIsOpen}
      isPlain
      dropdownItems={[
        <DropdownItem
          isDisabled={
            hasCondition(conditions, StatusConditionsType.Execute) ||
            hasCondition(conditions, StatusConditionsType.Finished) ||
            hasCondition(conditions, StatusConditionsType.Error)
          }
          onClick={() => {
            setKebabIsOpen(false);
            alert('TODO');
          }}
          key="Edit"
        >
          Edit
        </DropdownItem>,
        <DropdownItem
          isDisabled={hasCondition(conditions, StatusConditionsType.Execute)}
          onClick={() => {
            setKebabIsOpen(false);
            alert('TODO');
          }}
          key="Remove"
        >
          Remove
        </DropdownItem>,
      ]}
      position={DropdownPosition.right}
    />
  );
};

export default PlansActionsDropdown;
