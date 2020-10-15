import * as React from 'react';
import {
  TreeView,
  Alert,
  Tabs,
  Tab,
  TabTitleText,
  TextContent,
  Text,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useSelectionState } from '@konveyor/lib-ui';
import { useVMwareTreeQuery } from '@app/queries';
import { IVMwareProvider, VMwareTree, VMwareTreeType } from '@app/queries/types';
import { filterAndConvertVMwareTree, findVMTreePath, flattenVMwareTreeNodes } from './helpers';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import { PlanWizardFormState } from './PlanWizard';

import './FilterVMsForm.css';

interface IFilterVMsFormProps {
  form: PlanWizardFormState['filterVMs'];
  sourceProvider: IVMwareProvider | null;
}

const FilterVMsForm: React.FunctionComponent<IFilterVMsFormProps> = ({
  form,
  sourceProvider,
}: IFilterVMsFormProps) => {
  const [searchText, setSearchText] = React.useState('');

  const treeQuery = useVMwareTreeQuery(sourceProvider, form.values.treeType);

  const treeSelection = useSelectionState({
    items: flattenVMwareTreeNodes(treeQuery.data || null),
    externalState: [form.fields.selectedTreeNodes.value, form.fields.selectedTreeNodes.setValue],
    isEqual: (a: VMwareTree, b: VMwareTree) => a.object?.selfLink === b.object?.selfLink,
  });

  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    // Clear selection when the tree type tab changes
    if (!isFirstRender.current) {
      treeSelection.selectAll(false);
    }
    isFirstRender.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.treeType]);

  return (
    <div className="plan-wizard-filter-vms-form">
      <TextContent>
        <Text component="p">Filter the list of VMs that can be selected for migration.</Text>
      </TextContent>
      <Tabs
        activeKey={form.values.treeType}
        onSelect={(_event, tabKey) => form.fields.treeType.setValue(tabKey as VMwareTreeType)}
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
        <Alert variant="danger" isInline title="Error loading VMware tree data" />
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
              const matchingPath =
                treeQuery.data && findVMTreePath(treeQuery.data, treeViewItem.id || '');
              const matchingNode = matchingPath && matchingPath[matchingPath.length - 1];
              if (matchingNode) {
                const nodesToSelect: VMwareTree[] = [];
                const pushNodeAndDescendants = (n: VMwareTree) => {
                  nodesToSelect.push(n);
                  if (n.children) {
                    n.children.forEach(pushNodeAndDescendants);
                  }
                };
                pushNodeAndDescendants(matchingNode);
                treeSelection.selectMultiple(
                  nodesToSelect,
                  !treeSelection.isItemSelected(matchingNode)
                );
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

export default FilterVMsForm;
