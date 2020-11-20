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

interface IVMwareProviderHostsTableProps {
  providerName: string;
  hosts: IHost[];
}

const VMwareProviderHostsTable: React.FunctionComponent<IVMwareProviderHostsTableProps> = ({
  providerName,
  hosts,
}: IVMwareProviderHostsTableProps) => {
  const providersQuery = useProvidersQuery();
  const hostConfigsQuery = useHostConfigsQuery();

  const provider = providersQuery.data?.vsphere.find((provider) => provider.name === providerName);

  const columns: ICell[] = [
    { title: 'Name', transforms: [sortable] },
    { title: 'Network for migration data transfer', transforms: [sortable, cellWidth(30)] },
    { title: 'Bandwidth', transforms: [sortable] },
    { title: 'MTU', transforms: [sortable] },
  ];

  const getSortValues = (host: IHost) => {
    // TODO correlate inventory host with host CR to find selected network
    return ['', host.name, '(default)', '', ''];
  };

  const { sortBy, onSort, sortedItems } = useSortState(hosts, getSortValues);
  const { paginationProps } = usePaginationState(sortedItems, 10);
  const { selectedItems, toggleItemSelected, selectAll } = useSelectionState<IHost>({
    items: sortedItems,
  });

  const rows: IRow[] = sortedItems.map((host: IHost) => {
    // TODO correlate inventory host with host CR to find selected network
    return {
      meta: { host },
      selected: selectedItems.includes(host),
      cells: [host.name, '(default)', '', ''],
    };
  });

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
          hostConfigs={hostConfigsQuery.data?.items || []}
          provider={provider as IVMwareProvider}
          onClose={() => setIsSelectNetworkModalOpen(false)}
        />
      )}
    </>
  );
};

export default VMwareProviderHostsTable;
