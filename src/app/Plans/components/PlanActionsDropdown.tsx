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
  useCreateMigrationMutation,
} from '@app/queries';
import { MustGatherContext } from '@app/common/context';
import ConfirmModal from '@app/common/components/ConfirmModal';
import ConditionalTooltip from '@app/common/components/ConditionalTooltip';
import { areAssociatedProvidersReady } from '@app/queries/helpers';
import PlanDetailsModal from './PlanDetailsModal';
import { IMigration } from '@app/queries/types/migrations.types';
import { PlanState, archivedPlanLabel } from '@app/common/constants';

interface IPlansActionDropdownProps {
  plan: IPlan;
  planState: PlanState | null;
  canRestart: boolean;
}

export const PlanActionsDropdown: React.FunctionComponent<IPlansActionDropdownProps> = ({
  plan,
  planState,
  canRestart,
}: IPlansActionDropdownProps) => {
  const { withNs, latestAssociatedMustGather } = React.useContext(MustGatherContext);

  const mustGather = latestAssociatedMustGather(withNs(plan.metadata.name, 'plan'));

  const isPlanGathering = mustGather?.status === 'inprogress' || mustGather?.status === 'new';

  const history = useHistory();
  const onMigrationStarted = (migration: IMigration) => {
    history.push(`/plans/${migration.spec.plan.name}`);
  };
  const createMigrationMutation = useCreateMigrationMutation(onMigrationStarted);
  const [kebabIsOpen, setKebabIsOpen] = React.useState(false);
  const [isDeleteModalOpen, toggleDeleteModal] = React.useReducer((isOpen) => !isOpen, false);
  const [isDetailsModalOpen, toggleDetailsModal] = React.useReducer((isOpen) => !isOpen, false);
  const [isArchivePlanModalOpen, toggleArchivePlanModal] = React.useReducer(
    (isOpen) => !isOpen,
    false
  );
  const deletePlanMutation = useDeletePlanMutation(toggleDeleteModal);
  const archivePlanMutation = useArchivePlanMutation(toggleArchivePlanModal);
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
              isPlanGathering
                ? 'This plan cannot be edited because it is running must gather.'
                : isPlanArchived
                ? 'This plan cannot be edited because it has been archived'
                : isPlanStarted
                ? 'This plan cannot be edited because it has been started'
                : !areProvidersReady
                ? 'This plan cannot be edited because the inventory data for its associated providers is not ready'
                : ''
            }
          >
            <DropdownItem
              isDisabled={isPlanStarted || !areProvidersReady || isPlanArchived || isPlanGathering}
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
            isTooltipEnabled={
              hasCondition(conditions, 'Executing') ||
              deletePlanMutation.isLoading ||
              isPlanGathering
            }
            content={
              hasCondition(conditions, 'Executing')
                ? 'This plan cannot be deleted because it is running'
                : deletePlanMutation.isLoading
                ? 'This plan cannot be deleted because it is deleting'
                : isPlanGathering
                ? 'This plan cannot be deleted because it is running must gather service'
                : ''
            }
          >
            <DropdownItem
              isAriaDisabled={
                hasCondition(conditions, 'Executing') ||
                deletePlanMutation.isLoading ||
                isPlanGathering
              }
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
          ...((canRestart && [
            <ConditionalTooltip
              key="Restart"
              isTooltipEnabled={isPlanGathering}
              content="This plan cannot be restarted because it is running must gather service"
            >
              <DropdownItem
                isDisabled={isPlanGathering}
                onClick={() => {
                  createMigrationMutation.mutate(plan);
                }}
              >
                Restart
              </DropdownItem>
            </ConditionalTooltip>,
          ]) ||
            []),
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
