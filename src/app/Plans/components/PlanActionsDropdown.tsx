import * as React from 'react';
import { Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';
import { useHistory } from 'react-router-dom';

import { IPlan } from '@app/queries/types';
import { PlanStatusAPIType } from '@app/common/constants';
import { hasCondition } from '@app/common/helpers';
import { useDeletePlanMutation } from '@app/queries/plans';
import ConfirmDeleteModal from '@app/common/components/ConfirmDeleteModal';

interface IPlansActionDropdownProps {
  plan: IPlan;
}

const PlansActionsDropdown: React.FunctionComponent<IPlansActionDropdownProps> = ({
  plan,
}: IPlansActionDropdownProps) => {
  const [kebabIsOpen, setKebabIsOpen] = React.useState(false);
  const [isDeleteModalOpen, toggleDeleteModal] = React.useReducer((isOpen) => !isOpen, false);
  const [deletePlan, deletePlanResult] = useDeletePlanMutation(toggleDeleteModal);
  const history = useHistory();

  const conditions = plan.status?.conditions || [];

  return (
    <>
      <Dropdown
        aria-label="Actions"
        toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
        isOpen={kebabIsOpen}
        isPlain
        dropdownItems={[
          <DropdownItem
            isDisabled={!!plan.status?.migration?.started}
            onClick={() => {
              setKebabIsOpen(false);
              history.push(`/plans/${plan.metadata.name}/edit`);
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
              toggleDeleteModal();
            }}
            key="Delete"
          >
            Delete
          </DropdownItem>,
        ]}
        position={DropdownPosition.right}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        toggleOpen={toggleDeleteModal}
        deleteFn={() => deletePlan(plan)}
        deleteResult={deletePlanResult}
        title="Delete migration plan"
        body={
          <>
            Are you sure you want to delete the migration plan &quot;
            <strong>{plan.metadata.name}</strong>&quot;?
          </>
        }
        errorText="Error deleting plan"
      />
    </>
  );
};

export default PlansActionsDropdown;
