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
    isEqual: (a: VMwareTree, b: VMwareTree) => a.kind === b.kind && a.object?.id === b.object?.id,
  });
  const toggleNodeAndChildren = (node: VMwareTree, isSelecting: boolean) => {
    // TODO: this isn't going to work being called a bunch of times synchronously.
    //       we need a treeSelection.toggleItemsSelected (multiple items atomically)
    treeSelection.toggleItemSelected(node, isSelecting);
    if (node.children) {
      node.children.forEach((child) => toggleNodeAndChildren(child, isSelecting));
    }
  };

  console.log(treeSelection);

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
            treeSelection.isItemSelected
          )}
          defaultAllExpanded
          hasChecks
          onSearch={(event) => setSearchText(event.target.value)}
          onCheck={(_event, treeViewItem) => {
            const matchingNode =
              treeQuery.data && findMatchingNode(treeQuery.data, treeViewItem.id || '');
            if (matchingNode) {
              toggleNodeAndChildren(matchingNode, !treeSelection.isItemSelected(matchingNode));
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
