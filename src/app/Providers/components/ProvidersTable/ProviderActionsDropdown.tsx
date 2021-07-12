import * as React from 'react';
import { Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';
import { useDeleteProviderMutation } from '@app/queries';
import { ICorrelatedProvider, InventoryProvider } from '@app/queries/types';
import { ProviderType, PROVIDER_TYPE_NAMES } from '@app/common/constants';
import ConfirmModal from '@app/common/components/ConfirmModal';
import { EditProviderContext } from '@app/Providers/ProvidersPage';
import ConditionalTooltip from '@app/common/components/ConditionalTooltip';
import { hasCondition } from '@app/common/helpers';
import { isSameResource } from '@app/queries/helpers';

interface IProviderActionsDropdownProps {
  provider: ICorrelatedProvider<InventoryProvider>;
  providerType: ProviderType;
}

const ProviderActionsDropdown: React.FunctionComponent<IProviderActionsDropdownProps> = ({
  provider,
  providerType,
}: IProviderActionsDropdownProps) => {
  const [kebabIsOpen, setKebabIsOpen] = React.useState(false);
  const [isDeleteModalOpen, toggleDeleteModal] = React.useReducer((isOpen) => !isOpen, false);

  const deleteProviderMutation = useDeleteProviderMutation(providerType, toggleDeleteModal);

  const { openEditProviderModal, plans } = React.useContext(EditProviderContext);
  const hasRunningMigration = !!plans
    .filter((plan) => hasCondition(plan.status?.conditions || [], 'Executing'))
    .find((runningPlan) => {
      const { source, destination } = runningPlan.spec.provider;
      return (
        isSameResource(provider.metadata, source) || isSameResource(provider.metadata, destination)
      );
    });
  const isEditDeleteDisabled = !provider.spec.url || hasRunningMigration;
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
            isTooltipEnabled={isEditDeleteDisabled}
            content={
              !provider.spec.url
                ? 'The host provider cannot be edited'
                : hasRunningMigration
                ? 'This provider cannot be edited because it has running migrations'
                : ''
            }
          >
            <DropdownItem
              aria-label="Edit"
              onClick={() => {
                setKebabIsOpen(false);
                openEditProviderModal(provider);
              }}
              isDisabled={isEditDeleteDisabled}
            >
              Edit
            </DropdownItem>
          </ConditionalTooltip>,
          <ConditionalTooltip
            key="remove"
            isTooltipEnabled={isEditDeleteDisabled}
            content={
              !provider.spec.url
                ? 'The host provider cannot be removed'
                : hasRunningMigration
                ? 'This provider cannot be removed because it has running migrations'
                : ''
            }
          >
            <DropdownItem
              aria-label="Remove"
              onClick={() => {
                setKebabIsOpen(false);
                toggleDeleteModal();
              }}
              isDisabled={deleteProviderMutation.isLoading || isEditDeleteDisabled}
            >
              Remove
            </DropdownItem>
          </ConditionalTooltip>,
        ]}
        position={DropdownPosition.right}
      />
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        toggleOpen={toggleDeleteModal}
        mutateFn={() => deleteProviderMutation.mutate(provider)}
        mutateResult={deleteProviderMutation}
        title="Remove provider?"
        confirmButtonText="Remove"
        body={`${PROVIDER_TYPE_NAMES[providerType]} provider "${provider.metadata.name}" will not be selectable as a migration target.`}
        errorText="Error removing provider"
      />
    </>
  );
};

export default ProviderActionsDropdown;
