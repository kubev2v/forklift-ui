import * as React from 'react';
import { Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';
import { useDeleteProviderMutation } from '@app/queries';
import { Provider } from '@app/queries/types';
import { ProviderType, PROVIDER_TYPE_NAMES } from '@app/common/constants';
import ConfirmDeleteModal from '@app/common/components/ConfirmDeleteModal';
import { EditProviderContext } from '@app/Providers/ProvidersPage';

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
  const { openEditProviderModal } = React.useContext(EditProviderContext);
  return (
    <>
      <Dropdown
        aria-label="Actions"
        toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
        isOpen={kebabIsOpen}
        isPlain
        dropdownItems={[
          <DropdownItem
            onClick={() => {
              setKebabIsOpen(false);
              openEditProviderModal(provider);
            }}
            key="edit"
            isDisabled={!provider.object.spec.url}
          >
            Edit
          </DropdownItem>,
          <DropdownItem
            onClick={() => {
              setKebabIsOpen(false);
              toggleDeleteModal();
            }}
            isDisabled={deleteProviderResult.isLoading}
            key="remove"
          >
            Remove
          </DropdownItem>,
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
