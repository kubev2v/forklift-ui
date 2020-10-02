import * as React from 'react';
import { TreeView, Title, Alert, Tabs, Tab, TabTitleText } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useVMwareTreeQuery } from '@app/queries';
import { IVMwareProvider, VMwareTree, VMwareTreeType } from '@app/queries/types';
import { filterAndConvertVMwareTree, findMatchingNode, flattenVMwareTreeNodes } from './helpers';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import { PlanWizardFormState } from './PlanWizard';

import './FilterVMsForm.css';
import { useSelectionState } from '@konveyor/lib-ui';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IFilterVMsProps {
  form: PlanWizardFormState['filterVMs'];
  sourceProvider: IVMwareProvider | null;
}

const FilterVMs: React.FunctionComponent<IFilterVMsProps> = ({
  form,
  sourceProvider,
}: IFilterVMsProps) => {
  const [treeType, setTreeType] = React.useState(VMwareTreeType.Host);
  const [searchText, setSearchText] = React.useState('');

  const treeQuery = useVMwareTreeQuery(sourceProvider, treeType);

  const treeSelection = useSelectionState({
    items: flattenVMwareTreeNodes(treeQuery.data || null),
    externalState: [form.fields.selectedTreeNodes.value, form.fields.selectedTreeNodes.setValue],
    isEqual: (a: VMwareTree, b: VMwareTree) => a.object?.selfLink === b.object?.selfLink,
  });

  const toggleNodeAndChildren = (node: VMwareTree, isSelecting: boolean) => {
    const nodesToSelect: VMwareTree[] = [];
    const pushNodeAndChildren = (n: VMwareTree) => {
      nodesToSelect.push(n);
      if (n.children) {
        n.children.forEach(pushNodeAndChildren);
      }
    };
    pushNodeAndChildren(node);
    treeSelection.selectMultiple(nodesToSelect, isSelecting);
  };

  return (
    <div className="plan-wizard-filter-vms-form">
      <Title headingLevel="h2" size="md">
        Select datacenters, clusters and folders that contain the VMs to be included in the plan.
      </Title>
      <Tabs
        activeKey={treeType}
        onSelect={(_event, tabKey) => setTreeType(tabKey as VMwareTreeType)}
        className={spacing.mtMd}
      >
        <Tab
          key={VMwareTreeType.Host}
          eventKey={VMwareTreeType.Host}
          title={<TabTitleText>By clusters and hosts</TabTitleText>}
        />
        <Tab
          key={VMwareTreeType.VM}
          eventKey={VMwareTreeType.VM}
          title={<TabTitleText>By folders</TabTitleText>}
        />
      </Tabs>
      {treeQuery.isLoading ? (
        <LoadingEmptyState />
      ) : treeQuery.isError ? (
        <Alert variant="danger" title="Error loading VMware tree data" />
      ) : (
        <TreeView
          data={filterAndConvertVMwareTree(
            treeQuery.data || null,
            searchText,
            treeSelection.isItemSelected,
            treeSelection.areAllSelected
          )}
          defaultAllExpanded
          hasChecks
          onSearch={(event) => setSearchText(event.target.value)}
          onCheck={(_event, treeViewItem) => {
            if (treeViewItem.id === 'converted-root') {
              treeSelection.selectAll(!treeSelection.areAllSelected);
            } else {
              const matchingNode =
                treeQuery.data && findMatchingNode(treeQuery.data, treeViewItem.id || '');
              if (matchingNode) {
                toggleNodeAndChildren(matchingNode, !treeSelection.isItemSelected(matchingNode));
              }
            }
          }}
          searchProps={{
            id: 'inventory-search',
            name: 'search-inventory',
            'aria-label': 'Search inventory',
          }}
        />
      )}
    </div>
  );
};

export default FilterVMs;
