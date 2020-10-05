import * as React from 'react';
import { Button, Level, LevelItem, Pagination } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, sortable, ICell, IRow } from '@patternfly/react-table';
import { usePaginationState, useSortState } from '@app/common/hooks';
import { useSelectionState } from '@konveyor/lib-ui';
import { IHost } from '@app/queries/types';
import { formatHostNetwork } from './helpers';
import SelectNetworkModal from './SelectNetworkModal';

interface IVMwareProviderHostsTableProps {
  providerId?: string;
  hosts: IHost[];
}

const VMwareProviderHostsTable: React.FunctionComponent<IVMwareProviderHostsTableProps> = ({
  providerId,
  hosts,
}: IVMwareProviderHostsTableProps) => {
  const columns: ICell[] = [
    { title: 'Name', transforms: [sortable] },
    { title: 'Network for migration data transfer', transforms: [sortable] },
    { title: 'Bandwidth', transforms: [sortable] },
    { title: 'MTU', transforms: [sortable] },
  ];

  const getSortValues = (host: IHost) => {
    const { name, network, bandwidth, mtu } = host;
    return ['', name, formatHostNetwork(network), bandwidth, mtu];
  };

  const { sortBy, onSort, sortedItems } = useSortState(hosts, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  const { selectedItems, toggleItemSelected, selectAll } = useSelectionState<IHost>({
    items: sortedItems,
  });

  const rows: IRow[] = sortedItems.map((host: IHost) => {
    const { name } = host;
    return {
      meta: { host },
      selected: selectedItems.includes(host),
      cells: [name, formatHostNetwork(host.network), host.bandwidth, host.mtu],
    };
  });

  const [isSelectNetworkModalOpen, setIsSelectNetworkModalOpen] = React.useState(false);

  return (
    <>
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
          aria-label={`Hosts table for provider ${providerId}`}
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
            onClose={() => setIsSelectNetworkModalOpen(false)}
          />
        )}
      </>
    </>
  );
};

export default VMwareProviderHostsTable;
