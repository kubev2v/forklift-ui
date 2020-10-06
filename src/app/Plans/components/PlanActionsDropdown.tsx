import * as React from 'react';
import { Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';

import { IStatusCondition } from '@app/queries/types';
import { PlanStatusConditionsType } from '@app/common/constants';

interface IPlansActionDropdownProps {
  conditions: IStatusCondition[];
}

const PlansActionsDropdown: React.FunctionComponent<IPlansActionDropdownProps> = ({
  conditions,
}: IPlansActionDropdownProps) => {
  const [kebabIsOpen, setKebabIsOpen] = React.useState(false);

  const hasCondition = (type: string) => {
    return !!conditions.find((condition) => condition.type === type);
  };

  return (
    <Dropdown
      aria-label="Actions"
      toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
      isOpen={kebabIsOpen}
      isPlain
      dropdownItems={[
        <DropdownItem
          isDisabled={
            hasCondition(PlanStatusConditionsType.Execute) ||
            hasCondition(PlanStatusConditionsType.Finished) ||
            hasCondition(PlanStatusConditionsType.Error)
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
          isDisabled={hasCondition(PlanStatusConditionsType.Execute)}
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
