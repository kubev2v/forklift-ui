import * as React from 'react';
import { Pagination, Button, Level, LevelItem } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  sortable,
  compoundExpand,
  classNames as classNamesTransform,
  ICell,
  IRow,
} from '@patternfly/react-table';
import { OutlinedHddIcon } from '@patternfly/react-icons';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';

import { useSortState, usePaginationState, useSelectionState } from '@app/common/hooks';
import { IVMwareProvider } from '@app/Providers/types';
import VMwareProviderActionsDropdown from './VMwareProviderActionsDropdown';
import VMwareProviderHostsTable from './VMwareProviderHostsTable';
import ProviderStatus from '../ProviderStatus';

import './VMwareProvidersTable.css';

interface IVMwareProvidersTableProps {
  providers: IVMwareProvider[];
}

const VMwareProvidersTable: React.FunctionComponent<IVMwareProvidersTableProps> = ({
  providers,
}: IVMwareProvidersTableProps) => {
  const getSortValues = (provider: IVMwareProvider) => {
    const { numClusters, numHosts, numVMs, numNetworks, numDatastores } = provider.resourceCounts;
    return [
      '',
      provider.metadata.name,
      provider.spec.url,
      numClusters,
      numHosts,
      numVMs,
      numNetworks,
      numDatastores,
      provider.status.conditions[0].type, // TODO maybe surface the most serious status condition?
      '',
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(providers, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const { selectedItems, toggleItemSelected, areAllSelected, selectAll } = useSelectionState<
    IVMwareProvider
  >(sortedItems);
  const {
    selectedItems: expandedProviders,
    toggleItemSelected: toggleProviderExpanded,
  } = useSelectionState<IVMwareProvider>(sortedItems);

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
    { title: 'Hosts', transforms: [sortable], cellTransforms: [compoundExpand] },
    { title: 'VMs', transforms: [sortable] },
    { title: 'Networks', transforms: [sortable] },
    { title: 'Datastores', transforms: [sortable] },
    { title: 'Status', transforms: [sortable] },
    { title: '', columnTransforms: [classNamesTransform(tableStyles.tableAction)] },
  ];

  const rows: IRow[] = [];
  currentPageItems.forEach((provider: IVMwareProvider) => {
    const { numClusters, numHosts, numVMs, numNetworks, numDatastores } = provider.resourceCounts;
    const isSelected = selectedItems.includes(provider);
    const isExpanded = expandedProviders.includes(provider);
    rows.push({
      meta: { provider },
      isOpen: isExpanded,
      cells: [
        {
          title: (
            <input
              type="checkbox"
              aria-label={`Select provider ${provider.metadata.name}`}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                toggleItemSelected(provider, event.currentTarget.checked);
              }}
              checked={isSelected}
            />
          ),
        },
        provider.metadata.name,
        provider.spec.url,
        numClusters,
        {
          title: (
            <>
              <OutlinedHddIcon key="hosts-icon" /> {numHosts}
            </>
          ),
          props: {
            isOpen: isExpanded,
          },
        },
        numVMs,
        numNetworks,
        numDatastores,
        {
          title: <ProviderStatus provider={provider} />,
        },
        {
          title: <VMwareProviderActionsDropdown />,
        },
      ],
    });
    if (isExpanded) {
      rows.push({
        parent: rows.length - 1,
        compoundExpand: 4,
        cells: [
          {
            title: <VMwareProviderHostsTable provider={provider} />,
            props: { colSpan: columns.length, className: tableStyles.modifiers.noPadding },
          },
        ],
      });
    }
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
