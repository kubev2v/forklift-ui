import * as React from 'react';
import {
  Dropdown,
  KebabToggle,
  DropdownItem,
  DropdownPosition,
  Modal,
  Button,
  TextContent,
  Text,
  List,
  ListItem,
} from '@patternfly/react-core';
import { useHistory } from 'react-router-dom';

import { IPlan } from '@app/queries/types';
import { hasCondition } from '@app/common/helpers';
import {
  useClusterProvidersQuery,
  useDeletePlanMutation,
  useArchivePlanMutation,
} from '@app/queries';
import ConfirmModal from '@app/common/components/ConfirmModal';
import ConditionalTooltip from '@app/common/components/ConditionalTooltip';
import { areAssociatedProvidersReady } from '@app/queries/helpers';
import PlanDetailsModal from './PlanDetailsModal';
import { PlanState, archivedPlanLabel } from '@app/common/constants';

interface IPlansActionDropdownProps {
  plan: IPlan;
  planState: PlanState | null;
}

const PlansActionsDropdown: React.FunctionComponent<IPlansActionDropdownProps> = ({
  plan,
  planState,
}: IPlansActionDropdownProps) => {
  const [kebabIsOpen, setKebabIsOpen] = React.useState(false);
  const [isDeleteModalOpen, toggleDeleteModal] = React.useReducer((isOpen) => !isOpen, false);
  const [isDetailsModalOpen, toggleDetailsModal] = React.useReducer((isOpen) => !isOpen, false);
  const [isArchivePlanModalOpen, toggleArchivePlanModal] = React.useReducer(
    (isOpen) => !isOpen,
    false
  );
  const deletePlanMutation = useDeletePlanMutation(toggleDeleteModal);
  const archivePlanMutation = useArchivePlanMutation(toggleArchivePlanModal);
  const history = useHistory();
  const conditions = plan.status?.conditions || [];
  const clusterProvidersQuery = useClusterProvidersQuery();
  const areProvidersReady = React.useMemo(
    () => kebabIsOpen && areAssociatedProvidersReady(clusterProvidersQuery, plan.spec.provider),
    [kebabIsOpen, clusterProvidersQuery, plan.spec.provider]
  );
  const isPlanStarted = !!plan.status?.migration?.started;
  const isPlanArchived = plan.metadata.annotations?.[archivedPlanLabel] === 'true';
  const isPlanCompleted =
    !planState?.toLowerCase().includes('finished') &&
    !planState?.toLowerCase().includes('failed') &&
    !planState?.toLowerCase().includes('canceled');
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
              isPlanArchived
                ? 'This plan cannot be edited because it has been archived'
                : isPlanStarted
                ? 'This plan cannot be edited because it has been started'
                : !areProvidersReady
                ? 'This plan cannot be edited because the inventory data for its associated providers is not ready'
                : ''
            }
          >
            <DropdownItem
              isDisabled={isPlanStarted || !areProvidersReady || isPlanArchived}
              onClick={() => {
                setKebabIsOpen(false);
                history.push(`/plans/${plan.metadata.name}/edit`);
              }}
            >
              Edit
            </DropdownItem>
          </ConditionalTooltip>,
          <DropdownItem
            key="duplicate"
            onClick={() => {
              setKebabIsOpen(false);
              history.push(`/plans/${plan.metadata.name}/duplicate`);
            }}
          >
            Duplicate
          </DropdownItem>,
          <ConditionalTooltip
            key="archive-tooltip"
            isTooltipEnabled={isPlanCompleted || isPlanArchived}
            content={
              isPlanArchived
                ? 'Plans cannot be unarchived.'
                : 'This plan cannot be archived because it is not completed.'
            }
          >
            <DropdownItem
              isDisabled={isPlanCompleted || isPlanArchived}
              key="archive"
              onClick={() => {
                setKebabIsOpen(false);
                toggleArchivePlanModal();
              }}
            >
              Archive
            </DropdownItem>
          </ConditionalTooltip>,
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
      <Modal
        variant="medium"
        title="Archive plan"
        isOpen={isArchivePlanModalOpen}
        onClose={toggleArchivePlanModal}
        actions={[
          <Button
            key="archive"
            variant="primary"
            onClick={() => {
              archivePlanMutation.mutate(plan);
            }}
          >
            Archive
          </Button>,
          <Button key="cancel-archive" variant="secondary" onClick={toggleArchivePlanModal}>
            Cancel
          </Button>,
        ]}
      >
        <TextContent>
          <Text>Archiving a plan means:</Text>
          <List>
            <ListItem>All migration history and metadata are cleaned up and discarded.</ListItem>
            <ListItem>Migration logs are deleted.</ListItem>
            <ListItem>
              The plan can no longer be edited or restarted, but it can be viewed.
            </ListItem>
          </List>
        </TextContent>
      </Modal>
    </>
  );
};

export { PlansActionsDropdown };
