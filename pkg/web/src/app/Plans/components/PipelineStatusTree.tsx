import * as React from 'react';
import {
  TreeView,
  TreeViewDataItem,
  Dropdown,
  KebabToggle,
  DropdownItem,
} from '@patternfly/react-core';
import { IPlan, IVMStatus, SourceVM } from '@app/queries/types';

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
    <DropdownItem key={`view-logs-${vm.id}`} isDisabled component="button">
      View logs
    </DropdownItem>,
  ];

  const options = [
    {
      name: `Plan: ${vm.host}/${plan.spec.targetNamespace}/${plan.metadata.name}`,
      id: `root-${plan.spec.targetNamespace}-${plan.metadata.name}-${vm.id}-${vmStatus.id}`,
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
          id: `${plan.spec.targetNamespace}-${vm.id}-${vmStatus.id}`,
          children: [
            {
              name: 'VMs',
              id: 'vms',
              children: [
                {
                  name: `${vm.name} (${vm.id}) - ${vmStatus.phase}`,
                  id: `${vm.id}-leaf`,
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
