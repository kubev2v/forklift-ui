import * as React from 'react';
import { TreeView, Tabs, Tab, TabTitleText, TextContent, Text } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useSelectionState } from '@konveyor/lib-ui';
import { useInventoryTreeQuery, useSourceVMsQuery } from '@app/queries';
import {
  IPlan,
  SourceInventoryProvider,
  InventoryTree,
  InventoryTreeType,
} from '@app/queries/types';
import {
  filterAndConvertInventoryTree,
  findMatchingNode,
  findMatchingNodeAndDescendants,
  findNodesMatchingSelectedVMs,
  flattenInventoryTreeNodes,
  getAvailableVMs,
  getSelectableNodes,
  getSelectedVMsFromPlan,
  isNodeFullyChecked,
  useIsNodeSelectableCallback,
} from './helpers';
import { PlanWizardFormState } from './PlanWizard';

import { ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { usePausedPollingEffect } from '@app/common/context';
import { LONG_LOADING_MESSAGE } from '@app/queries/constants';

interface IFilterVMsFormProps {
  form: PlanWizardFormState['filterVMs'];
  sourceProvider: SourceInventoryProvider | null;
  planBeingEdited: IPlan | null;
}

// TODO also for the folder path column, make a hash of folder ids to tree nodes, so we can walk up their parents to build the path string

const FilterVMsForm: React.FunctionComponent<IFilterVMsFormProps> = ({
  form,
  sourceProvider,
  planBeingEdited,
}: IFilterVMsFormProps) => {
  usePausedPollingEffect();

  const [searchText, setSearchText] = React.useState('');

  const vmsQuery = useSourceVMsQuery(sourceProvider);
  const treeQuery = useInventoryTreeQuery(sourceProvider, form.values.treeType);

  const isNodeSelectable = useIsNodeSelectableCallback(form.values.treeType);

  const treeSelection = useSelectionState({
    items: getSelectableNodes(treeQuery.data || null, isNodeSelectable),
    externalState: [form.fields.selectedTreeNodes.value, form.fields.selectedTreeNodes.setValue],
    isEqual: (a: InventoryTree, b: InventoryTree) => a.object?.selfLink === b.object?.selfLink,
  });

  const isFirstRender = React.useRef(true);
  const lastTreeType = React.useRef(form.values.treeType);
  React.useEffect(() => {
    // Clear or reset selection when the tree type tab changes
    const treeTypeChanged = form.values.treeType !== lastTreeType.current;
    if (!isFirstRender.current && treeTypeChanged) {
      if (!planBeingEdited || !form.values.isPrefilled) {
        treeSelection.selectAll(false);
        lastTreeType.current = form.values.treeType;
      } else if (vmsQuery.isSuccess && treeQuery.isSuccess) {
        const selectedVMs = getSelectedVMsFromPlan(planBeingEdited, vmsQuery);
        const selectedTreeNodes = findNodesMatchingSelectedVMs(
          treeQuery.data || null,
          selectedVMs,
          isNodeSelectable
        );
        treeSelection.setSelectedItems(selectedTreeNodes);
        lastTreeType.current = form.values.treeType;
      }
    }
    isFirstRender.current = false;
  }, [
    form.values.treeType,
    form.values.isPrefilled,
    planBeingEdited,
    treeQuery,
    vmsQuery,
    treeSelection,
    isNodeSelectable,
  ]);

  const getNodeBadgeContent = (node: InventoryTree) => {
    const selectedDescendants = flattenInventoryTreeNodes(node).filter(
      treeSelection.isItemSelected
    );
    const numVMs =
      getAvailableVMs(selectedDescendants, vmsQuery.data || [], form.values.treeType).length ||
      null;
    if (numVMs) return numVMs;
    if (treeSelection.isItemSelected(node)) return '0';
    return null;
  };

  return (
    <div className="plan-wizard-filter-vms-form">
      <TextContent>
        <Text component="p">
          Refine the list of VMs selectable for migration by clusters
          {sourceProvider?.type === 'vsphere' ? ' or by folders' : ''}.
        </Text>
      </TextContent>
      {sourceProvider?.type === 'vsphere' ? (
        <Tabs
          activeKey={form.values.treeType}
          onSelect={(_event, tabKey) => form.fields.treeType.setValue(tabKey as InventoryTreeType)}
          className={spacing.mtMd}
        >
          <Tab
            key={InventoryTreeType.Cluster}
            eventKey={InventoryTreeType.Cluster}
            title={<TabTitleText>By clusters</TabTitleText>}
          />
          <Tab
            key={InventoryTreeType.VM}
            eventKey={InventoryTreeType.VM}
            title={<TabTitleText>By folders</TabTitleText>}
          />
        </Tabs>
      ) : null}
      <ResolvedQueries
        results={[vmsQuery, treeQuery]}
        errorTitles={['Error loading VMs', 'Error loading inventory tree data']}
        emptyStateBody={LONG_LOADING_MESSAGE}
      >
        <TreeView
          data={filterAndConvertInventoryTree(
            treeQuery.data || null,
            searchText,
            treeSelection.isItemSelected,
            treeSelection.areAllSelected,
            isNodeSelectable,
            getNodeBadgeContent
          )}
          defaultAllExpanded
          hasChecks
          hasBadges
          onSearch={(event) => setSearchText(event.target.value)}
          onCheck={(_event, treeViewItem) => {
            if (treeViewItem.id === 'converted-root') {
              treeSelection.selectAll(!treeSelection.areAllSelected);
            } else {
              const matchingNode = findMatchingNode(treeQuery.data || null, treeViewItem.id || '');
              const isFullyChecked = isNodeFullyChecked(
                matchingNode,
                treeSelection.isItemSelected,
                isNodeSelectable
              );
              const nodesToSelect = findMatchingNodeAndDescendants(
                treeQuery.data || null,
                treeViewItem.id || '',
                isNodeSelectable
              );
              if (nodesToSelect.length > 0) {
                treeSelection.selectMultiple(nodesToSelect, !isFullyChecked);
              }
            }
          }}
          searchProps={{
            id: 'inventory-search',
            name: 'search-inventory',
            'aria-label': 'Search inventory',
          }}
        />
      </ResolvedQueries>
    </div>
  );
};

export default FilterVMsForm;
