import * as React from 'react';
import { TreeView, Title, Alert, Tabs, Tab, TabTitleText } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useProvidersQuery, useVMwareTreeQuery } from '@app/queries';
import { VMwareTreeType } from '@app/queries/types';
import { filterAndConvertVMwareTree } from './helpers';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';

import './FilterVMsForm.css';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IFilterVMsProps {
  // sourceProvider: IVMwareProvider;
}

const FilterVMs: React.FunctionComponent<IFilterVMsProps> = () => {
  ////// TODO remove this and instead use sourceProvider from GeneralForm when we lift that state
  const providersQuery = useProvidersQuery();
  const sourceProvider = providersQuery.data?.vsphere[0] || null;
  /////////////// ^

  const [treeType, setTreeType] = React.useState(VMwareTreeType.Host);
  const [searchText, setSearchText] = React.useState('');

  const treeQuery = useVMwareTreeQuery(sourceProvider, treeType);

  const onSelect = (event, treeViewItem, parentItem) => {
    return;
  };

  const onCheck = (event, treeViewItem) => {
    return;
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
          data={filterAndConvertVMwareTree(treeQuery.data || null, searchText)}
          defaultAllExpanded
          hasChecks
          onSearch={(event) => setSearchText(event.target.value)}
          onSelect={onSelect}
          onCheck={onCheck}
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
