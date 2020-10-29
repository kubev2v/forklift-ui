import * as React from 'react';
import { Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';
import { ProviderType } from '@app/common/constants';
import { useDeleteProviderMutation } from '@app/queries';
import { IOpenShiftProvider } from '@app/queries/types';

interface IOpenShiftProviderActionsDropdownProps {
  provider: IOpenShiftProvider;
}

const OpenShiftProviderActionsDropdown: React.FunctionComponent<IOpenShiftProviderActionsDropdownProps> = ({
  provider,
}: IOpenShiftProviderActionsDropdownProps) => {
  const [kebabIsOpen, setKebabIsOpen] = React.useState(false);
  const [deleteProvider, deleteProviderResult] = useDeleteProviderMutation(ProviderType.openshift);
  return (
    <Dropdown
      aria-label="Actions"
      toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
      isOpen={kebabIsOpen}
      isPlain
      dropdownItems={[
        <DropdownItem
          onClick={() => {
            setKebabIsOpen(false);
            alert('TODO');
          }}
          key="edit"
        >
          Edit
        </DropdownItem>,
        <DropdownItem
          onClick={() => {
            setKebabIsOpen(false);
            deleteProvider(provider);
          }}
          isDisabled={deleteProviderResult.isLoading}
          key="remove"
        >
          Remove
        </DropdownItem>,
      ]}
      position={DropdownPosition.right}
    />
  );
};

export default OpenShiftProviderActionsDropdown;
