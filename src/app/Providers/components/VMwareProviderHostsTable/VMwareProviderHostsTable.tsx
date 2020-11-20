import * as React from 'react';
import { Alert, Button, Level, LevelItem, Pagination } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  sortable,
  ICell,
  IRow,
  cellWidth,
} from '@patternfly/react-table';
import { usePaginationState, useSortState } from '@app/common/hooks';
import { useSelectionState } from '@konveyor/lib-ui';
import { IHost, IVMwareProvider } from '@app/queries/types';
import SelectNetworkModal from './SelectNetworkModal';
import { useHostConfigsQuery, useProvidersQuery } from '@app/queries';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import { findSelectedNetworkAdapter, formatHostNetworkAdapter } from './helpers';

interface IVMwareProviderHostsTableProps {
  providerName: string;
  hosts: IHost[];
}

const VMwareProviderHostsTable: React.FunctionComponent<IVMwareProviderHostsTableProps> = ({
  providerName,
  hosts,
}: IVMwareProviderHostsTableProps) => {
  const providersQuery = useProvidersQuery();
  const provider = providersQuery.data?.vsphere.find((provider) => provider.name === providerName);

  const hostConfigsQuery = useHostConfigsQuery();
  const hostConfigs = hostConfigsQuery.data?.items || [];

  const columns: ICell[] = [
    { title: 'Name', transforms: [sortable] },
    { title: 'Network for migration data transfer', transforms: [sortable, cellWidth(30)] },
    { title: 'Bandwidth', transforms: [sortable] },
    { title: 'MTU', transforms: [sortable] },
  ];

  const getCells = (host: IHost) => {
    const networkAdapter = findSelectedNetworkAdapter(host, hostConfigs, provider || null);
    return [
      host.name,
      networkAdapter ? formatHostNetworkAdapter(networkAdapter) : '(default)',
      networkAdapter ? `${networkAdapter.linkSpeed} Mbps` : '',
      networkAdapter?.mtu || '',
    ];
  };

  const getSortValues = (host: IHost) => ['', ...getCells(host)];

  const { sortBy, onSort, sortedItems } = useSortState(hosts, getSortValues);
  const { paginationProps } = usePaginationState(sortedItems, 10);
  const { selectedItems, isItemSelected, toggleItemSelected, selectAll } = useSelectionState<IHost>(
    {
      items: sortedItems,
      isEqual: (a, b) => a.id === b.id,
    }
  );

  const rows: IRow[] = sortedItems.map((host: IHost) => ({
    meta: { host },
    selected: isItemSelected(host),
    cells: getCells(host),
  }));

  const [isSelectNetworkModalOpen, setIsSelectNetworkModalOpen] = React.useState(false);

  return providersQuery.isLoading || hostConfigsQuery.isLoading ? (
    <LoadingEmptyState />
  ) : providersQuery.isError ? (
    <Alert variant="danger" isInline title="Error loading providers" />
  ) : hostConfigsQuery.isError ? (
    <Alert variant="danger" isInline title="Error loading host configurations" />
  ) : (
    <>
      <Level>
        <LevelItem>
          <Button
            variant="secondary"
            onClick={() => setIsSelectNetworkModalOpen(true)}
            isDisabled={selectedItems.length === 0}
          >
            Select migration network
          </Button>
        </LevelItem>
        <LevelItem>
          <Pagination {...paginationProps} widgetId="providers-table-pagination-top" />
        </LevelItem>
      </Level>
      <Table
        className="provider-inner-hosts-table"
        aria-label={`Hosts table for provider ${providerName}`}
        cells={columns}
        rows={rows}
        sortBy={sortBy}
        onSort={onSort}
        onSelect={(_event, isSelected, rowIndex, rowData) => {
          if (rowIndex === -1) {
            selectAll(isSelected);
          }
          toggleItemSelected(rowData.meta.host, isSelected);
        }}
      >
        <TableHeader />
        <TableBody />
      </Table>
      {isSelectNetworkModalOpen && (
        <SelectNetworkModal
          selectedHosts={selectedItems}
          hostConfigs={hostConfigs}
          provider={provider as IVMwareProvider}
          onClose={() => setIsSelectNetworkModalOpen(false)}
        />
      )}
    </>
  );
};

export default VMwareProviderHostsTable;
