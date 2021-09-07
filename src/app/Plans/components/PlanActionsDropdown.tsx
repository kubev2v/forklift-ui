import * as React from 'react';
import {
  Dropdown,
  KebabToggle,
  DropdownItem,
  DropdownPosition,
  Modal,
  Button,
} from '@patternfly/react-core';
import { useHistory } from 'react-router-dom';

import { IPlan } from '@app/queries/types';
import { hasCondition } from '@app/common/helpers';
import { useClusterProvidersQuery, useDeletePlanMutation } from '@app/queries';
import ConfirmModal from '@app/common/components/ConfirmModal';
import ConditionalTooltip from '@app/common/components/ConditionalTooltip';
import { areAssociatedProvidersReady } from '@app/queries/helpers';
import PlanDetailsModal from './PlanDetailsModal';

interface IPlansActionDropdownProps {
  plan: IPlan;
}

const PlansActionsDropdown: React.FunctionComponent<IPlansActionDropdownProps> = ({
  plan,
}: IPlansActionDropdownProps) => {
  const [kebabIsOpen, setKebabIsOpen] = React.useState(false);
  const [isDeleteModalOpen, toggleDeleteModal] = React.useReducer((isOpen) => !isOpen, false);
  const [isDetailsModalOpen, toggleDetailsModal] = React.useReducer((isOpen) => !isOpen, false);
  const deletePlanMutation = useDeletePlanMutation(toggleDeleteModal);
  const history = useHistory();
  const conditions = plan.status?.conditions || [];
  const clusterProvidersQuery = useClusterProvidersQuery();
  const areProvidersReady = React.useMemo(
    () => kebabIsOpen && areAssociatedProvidersReady(clusterProvidersQuery, plan.spec.provider),
    [kebabIsOpen, clusterProvidersQuery, plan.spec.provider]
  );
  const isPlanStarted = !!plan.status?.migration?.started;
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
            isTooltipEnabled={isPlanStarted || !areProvidersReady}
            content={
              isPlanStarted
                ? 'This plan cannot be edited because it has been started'
                : !areProvidersReady
                ? 'This plan cannot be edited because the inventory data for its associated providers is not ready'
                : ''
            }
          >
            <DropdownItem
              isDisabled={isPlanStarted || !areProvidersReady}
              onClick={() => {
                setKebabIsOpen(false);
                history.push(`/plans/${plan.metadata.name}/edit`);
              }}
            >
              Edit
            </DropdownItem>
          </ConditionalTooltip>,
          <DropdownItem
            key="clone"
            onClick={() => {
              setKebabIsOpen(false);
              history.push(`/plans/${plan.metadata.name}/clone`);
            }}
          >
            Clone
          </DropdownItem>,
          <ConditionalTooltip
            key="Delete"
            isTooltipEnabled={hasCondition(conditions, 'Executing') || deletePlanMutation.isLoading}
            content={
              hasCondition(conditions, 'Executing')
                ? 'This plan cannot be deleted because it is running'
                : deletePlanMutation.isLoading
                ? 'This plan cannot be deleted because it is deleting'
                : ''
            }
          >
            <DropdownItem
              isDisabled={hasCondition(conditions, 'Executing') || deletePlanMutation.isLoading}
              onClick={() => {
                setKebabIsOpen(false);
                toggleDeleteModal();
              }}
            >
              Delete
            </DropdownItem>
          </ConditionalTooltip>,
          <DropdownItem
            key="Details"
            onClick={() => {
              setKebabIsOpen(false);
              toggleDetailsModal();
            }}
          >
            View details
          </DropdownItem>,
        ]}
        position={DropdownPosition.right}
      />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        toggleOpen={toggleDeleteModal}
        mutateFn={() => deletePlanMutation.mutate(plan)}
        mutateResult={deletePlanMutation}
        title="Permanently delete migration plan?"
        confirmButtonText="Delete"
        body={`All data for migration plan "${plan.metadata.name}" will be lost.`}
        errorText="Could not delete migration plan"
      />
      <Modal
        variant="medium"
        title="Plan details"
        isOpen={isDetailsModalOpen}
        onClose={toggleDetailsModal}
        actions={[
          <Button key="close" variant="primary" onClick={toggleDetailsModal}>
            Close
          </Button>,
        ]}
      >
        <PlanDetailsModal plan={plan} />
      </Modal>
    </>
  );
};

export default PlansActionsDropdown;
