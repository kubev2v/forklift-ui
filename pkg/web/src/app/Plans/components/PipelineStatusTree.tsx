import * as React from 'react';
import {
  TreeView,
  TreeViewDataItem,
  Dropdown,
  KebabToggle,
  DropdownItem,
} from '@patternfly/react-core';
import { IPlan, IVMStatus, SourceVM } from '@app/queries/types';
import { CLUSTER_API_VERSION, META } from '@app/common/constants';

interface IPipelineStatusTree {
  plan: IPlan;
  vm: SourceVM;
  vmStatus: IVMStatus;
}

export const PipelineStatusTree: React.FunctionComponent<IPipelineStatusTree> = ({
  plan,
  vm,
  vmStatus,
}) => {
  const onNodeSelect = () => {
    toggleDropdownOpen();
  };

  const onNodeKebabToggle = () => {
    toggleDropdownOpen();
  };

  const [isDropdownOpen, toggleDropdownOpen] = React.useReducer((isOpen) => !isOpen, false);

  const dropdownItems = [
    <DropdownItem key="action" isDisabled component="button">
      View logs
    </DropdownItem>,
    <DropdownItem isDisabled key="link">
      Copy <code>oc logs</code> command
    </DropdownItem>,
  ];

  const options = [
    {
      name: `Plan: ${vm.host}/${plan.spec.targetNamespace}/${plan.metadata.name}`,
      id: `${plan.spec.targetNamespace}-${plan.metadata.name}`,
      action: (
        <Dropdown
          onSelect={onNodeSelect}
          toggle={<KebabToggle onToggle={onNodeKebabToggle} />}
          isOpen={isDropdownOpen}
          isPlain
          dropdownItems={dropdownItems}
        />
      ),
      children: [
        {
          // name: 'Migration: host/openshift-migration/state-migration-0d126',
          // name: `Migration: ${vm.path}`,
          name: `Migration: ${vm.host}/${plan.spec.targetNamespace}/?`,
          id: `${plan.spec.targetNamespace}-foo?`,
          children: [
            {
              name: 'VMs',
              id: 'vms',
              children: [
                {
                  name: `${vm.name} (${vm.id}) - ${vmStatus.phase}`,
                  id: `${vm.id}`,
                },
              ],
            },
          ],
        },
      ],
      defaultExpanded: true,
    },
  ];

  const [activeItems, setActiveItems] = React.useState<TreeViewDataItem[] | undefined>();

  const onSelect = (
    evt: React.MouseEvent<Element, MouseEvent>,
    item: TreeViewDataItem,
    parentItem: TreeViewDataItem
  ) => {
    setActiveItems([item]);
  };

  return (
    <>
      <TreeView data={options} activeItems={activeItems} onSelect={onSelect} />
    </>
  );
};
