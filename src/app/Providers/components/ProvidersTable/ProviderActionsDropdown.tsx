import * as React from 'react';
import { Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';
import { useDeleteProviderMutation } from '@app/queries';
import { Provider } from '@app/queries/types';
import { PlanStatusAPIType, ProviderType, PROVIDER_TYPE_NAMES } from '@app/common/constants';
import ConfirmDeleteModal from '@app/common/components/ConfirmDeleteModal';
import { EditProviderContext } from '@app/Providers/ProvidersPage';
import ConditionalTooltip from '@app/common/components/ConditionalTooltip';
import { hasCondition } from '@app/common/helpers';
import { isSameResource } from '@app/queries/helpers';

interface IProviderActionsDropdownProps {
  provider: Provider;
  providerType: ProviderType;
}

const ProviderActionsDropdown: React.FunctionComponent<IProviderActionsDropdownProps> = ({
  provider,
  providerType,
}: IProviderActionsDropdownProps) => {
  const [kebabIsOpen, setKebabIsOpen] = React.useState(false);
  const [isDeleteModalOpen, toggleDeleteModal] = React.useReducer((isOpen) => !isOpen, false);
  const [deleteProvider, deleteProviderResult] = useDeleteProviderMutation(
    providerType,
    toggleDeleteModal
  );
  const { openEditProviderModal, plans } = React.useContext(EditProviderContext);
  const hasRunningMigration = !!plans
    .filter((plan) => hasCondition(plan.status?.conditions || [], PlanStatusAPIType.Executing))
    .find((runningPlan) => {
      const { source, destination } = runningPlan.spec.provider;
      return isSameResource(provider, source) || isSameResource(provider, destination);
    });
  const isEditDeleteDisabled = !provider.object.spec.url || hasRunningMigration;
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
              !provider.object.spec.url
                ? 'The host provider cannot be edited'
                : hasRunningMigration
                ? 'This provider cannot be edited because it has running migrations'
                : ''
            }
          >
            <DropdownItem
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
              !provider.object.spec.url
                ? 'The host provider cannot be removed'
                : hasRunningMigration
                ? 'This provider cannot be removed because it has running migrations'
                : ''
            }
          >
            <DropdownItem
              onClick={() => {
                setKebabIsOpen(false);
                toggleDeleteModal();
              }}
              isDisabled={deleteProviderResult.isLoading || isEditDeleteDisabled}
            >
              Remove
            </DropdownItem>
          </ConditionalTooltip>,
        ]}
        position={DropdownPosition.right}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        toggleOpen={toggleDeleteModal}
        deleteFn={() => deleteProvider(provider)}
        deleteResult={deleteProviderResult}
        title="Remove provider"
        body={
          <>
            Are you sure you want to remove the {PROVIDER_TYPE_NAMES[providerType]} provider &quot;
            <strong>{provider.name}</strong>&quot;?
          </>
        }
        deleteButtonText="Remove"
        errorText="Error removing provider"
      />
    </>
  );
};

export default ProviderActionsDropdown;
