import * as React from 'react';
import { Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';

import { IPlan } from '@app/queries/types';
import { PlanStatusAPIType } from '@app/common/constants';
import { hasCondition } from '@app/common/helpers';
import { useDeletePlanMutation } from '@app/queries/plans';

interface IPlansActionDropdownProps {
  plan: IPlan;
}

const PlansActionsDropdown: React.FunctionComponent<IPlansActionDropdownProps> = ({
  plan,
}: IPlansActionDropdownProps) => {
  const [kebabIsOpen, setKebabIsOpen] = React.useState(false);
  const [deletePlan, deletePlanResult] = useDeletePlanMutation();

  const conditions = plan.status?.conditions || [];

  return (
    <Dropdown
      aria-label="Actions"
      toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
      isOpen={kebabIsOpen}
      isPlain
      dropdownItems={[
        <DropdownItem
          isDisabled={
            hasCondition(conditions, PlanStatusAPIType.Executing) ||
            hasCondition(conditions, PlanStatusAPIType.Succeeded) ||
            hasCondition(conditions, PlanStatusAPIType.Failed)
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
          isDisabled={
            hasCondition(conditions, PlanStatusAPIType.Executing) || deletePlanResult.isLoading
          }
          onClick={() => {
            setKebabIsOpen(false);
            deletePlan(plan);
          }}
          key="Delete"
        >
          Delete
        </DropdownItem>,
      ]}
      position={DropdownPosition.right}
    />
  );
};

export default PlansActionsDropdown;
