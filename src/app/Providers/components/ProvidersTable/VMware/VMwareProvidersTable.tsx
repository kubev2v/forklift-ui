import * as React from 'react';
import { Pagination, Button, Level, LevelItem } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  sortable,
  classNames as classNamesTransform,
  ICell,
  IRow,
} from '@patternfly/react-table';
import { OutlinedHddIcon } from '@patternfly/react-icons';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';
import { useSelectionState } from '@konveyor/lib-ui';

import { useSortState, usePaginationState } from '@app/common/hooks';
import { IVMwareProvider } from '@app/queries/types';
import VMwareProviderActionsDropdown from './VMwareProviderActionsDropdown';
import VMwareProviderHostsTable from '../../VMwareProviderHostsTable';
import ProviderStatus from '../ProviderStatus';

import './VMwareProvidersTable.css';
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom';

interface IVMwareProvidersTableProps {
  providers: IVMwareProvider[];
}

const VMwareProvidersTable: React.FunctionComponent<IVMwareProvidersTableProps> = ({
  providers,
}: IVMwareProvidersTableProps) => {
  const { path, url } = useRouteMatch();
  console.log('path', path);

  const getSortValues = (provider: IVMwareProvider) => {
    const { clusterCount, hostCount, vmCount, networkCount, datastoreCount } = provider;
    return [
      '',
      provider.name,
      provider.object.spec.url,
      clusterCount,
      hostCount,
      vmCount,
      networkCount,
      datastoreCount,
      provider.object.status.conditions[0].type, // TODO maybe surface the most serious status condition?
      '',
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(providers, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const {
    selectedItems,
    toggleItemSelected,
    areAllSelected,
    selectAll,
    isItemSelected,
  } = useSelectionState<IVMwareProvider>({ items: sortedItems });
  const {
    toggleItemSelected: toggleProviderExpanded,
    isItemSelected: isItemExpanded,
  } = useSelectionState<IVMwareProvider>({
    items: sortedItems,
    isEqual: (a, b) => a.name === b.name,
  });

  const columns: ICell[] = [
    {
      // Using a custom column instead of Table's onSelect prop due to issues
      title: (
        <input
          type="checkbox"
          aria-label="Select all providers"
          onChange={(event: React.FormEvent<HTMLInputElement>) => {
            selectAll(event.currentTarget.checked);
          }}
          checked={areAllSelected}
        />
      ),
      columnTransforms: [classNamesTransform(tableStyles.tableCheck)],
    },
    { title: 'Name', transforms: [sortable] },
    { title: 'Endpoint', transforms: [sortable] },
    { title: 'Clusters', transforms: [sortable] },
    { title: 'Hosts', transforms: [sortable] },
    { title: 'VMs', transforms: [sortable] },
    { title: 'Networks', transforms: [sortable] },
    { title: 'Datastores', transforms: [sortable] },
    { title: 'Status', transforms: [sortable] },
    { title: '', columnTransforms: [classNamesTransform(tableStyles.tableAction)] },
  ];

  const rows: IRow[] = [];
  currentPageItems.forEach((provider: IVMwareProvider) => {
    const { clusterCount, hostCount, vmCount, networkCount, datastoreCount } = provider;
    const isSelected = isItemSelected(provider);
    const isExpanded = isItemExpanded(provider);
    rows.push({
      meta: { provider },
      isOpen: isExpanded,
      cells: [
        {
          title: (
            <input
              type="checkbox"
              aria-label={`Select provider ${provider.name}`}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                toggleItemSelected(provider, event.currentTarget.checked);
              }}
              checked={isSelected}
            />
          ),
        },
        provider.name,
        provider.object.spec.url,
        clusterCount,
        {
          title: (
            <>
              <Button onClick={() => console.log('route to hosts table')} variant="link">
                <Link to={`${url}providers/${provider.name}`}>
                  <OutlinedHddIcon key="hosts-icon" /> {hostCount}
                </Link>
              </Button>
            </>
          ),
        },
        vmCount,
        networkCount,
        datastoreCount,
        {
          title: <ProviderStatus provider={provider} />,
        },
        {
          title: <VMwareProviderActionsDropdown />,
        },
      ],
    });
  });

  return (
    <>
      <Level>
        <LevelItem>
          <Button
            variant="secondary"
            onClick={() => alert('TODO')}
            isDisabled={selectedItems.length === 0}
          >
            Download data
          </Button>
        </LevelItem>
        <LevelItem>
          <Pagination {...paginationProps} widgetId="providers-table-pagination-top" />
        </LevelItem>
      </Level>
      <Table
        aria-label="VMware providers table"
        cells={columns}
        rows={rows}
        sortBy={sortBy}
        onSort={onSort}
        onExpand={(_event, _rowIndex, _colIndex, _isOpen, rowData) => {
          toggleProviderExpanded(rowData.meta.provider);
        }}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <Pagination
        {...paginationProps}
        widgetId="providers-table-pagination-bottom"
        variant="bottom"
      />
    </>
  );
};

export default VMwareProvidersTable;
