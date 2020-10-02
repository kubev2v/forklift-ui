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

  const hasNotCondition = (type: string) => {
    return !conditions.find((condition) => condition.type === type);
  };

  return (
    <Dropdown
      aria-label="Actions"
      toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
      isOpen={kebabIsOpen}
      isPlain
      dropdownItems={[
        <DropdownItem
          isDisabled={hasNotCondition(PlanStatusConditionsType.Ready)}
          onClick={() => {
            setKebabIsOpen(false);
            alert('TODO');
          }}
          key="Edit"
        >
          Edit
        </DropdownItem>,
        <DropdownItem
          isDisabled={
            hasNotCondition(PlanStatusConditionsType.Ready) &&
            hasNotCondition(PlanStatusConditionsType.Finished) &&
            hasNotCondition(PlanStatusConditionsType.Error)
          }
          onClick={() => {
            setKebabIsOpen(false);
            alert('TODO');
          }}
          key="Delete"
        >
          Remove
        </DropdownItem>,
      ]}
      position={DropdownPosition.right}
    />
  );
};

export default PlansActionsDropdown;
