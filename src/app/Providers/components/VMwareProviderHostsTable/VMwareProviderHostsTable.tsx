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
import { useHostConfigsQuery } from '@app/queries';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import { findSelectedNetworkAdapter, formatHostNetworkAdapter } from './helpers';
import ConditionalTooltip from '@app/common/components/ConditionalTooltip';

interface IVMwareProviderHostsTableProps {
  provider: IVMwareProvider;
  hosts: IHost[];
}

const VMwareProviderHostsTable: React.FunctionComponent<IVMwareProviderHostsTableProps> = ({
  provider,
  hosts,
}: IVMwareProviderHostsTableProps) => {
  const hostConfigsQuery = useHostConfigsQuery();
  const hostConfigs = hostConfigsQuery.data?.items || [];

  const columns: ICell[] = [
    { title: 'Name', transforms: [sortable] },
    { title: 'Network for migration data transfer', transforms: [sortable, cellWidth(30)] },
    { title: 'Bandwidth', transforms: [sortable] },
    { title: 'MTU', transforms: [sortable] },
  ];

  const getCells = (host: IHost) => {
    const networkAdapter = findSelectedNetworkAdapter(host, hostConfigs, provider);
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

  const commonNetworkAdapters = (hosts: IHost[]) =>
    hosts[0].networkAdapters.filter(({ ipAddress }) =>
      hosts.every((host) => host.networkAdapters.some((na) => na.ipAddress === ipAddress))
    );

  const hasCommonNetworkAdapters = () => {
    if (selectedItems.length > 0) {
      return commonNetworkAdapters(selectedItems).length > 0 ? true : false;
    }
    return false;
  };

  const rows: IRow[] = sortedItems.map((host: IHost) => ({
    meta: { host },
    selected: isItemSelected(host),
    cells: getCells(host),
  }));

  const [isSelectNetworkModalOpen, setIsSelectNetworkModalOpen] = React.useState(false);

  return hostConfigsQuery.isLoading ? (
    <LoadingEmptyState />
  ) : hostConfigsQuery.isError ? (
    <Alert variant="danger" isInline title="Error loading host configurations" />
  ) : (
    <>
      <Level>
        <LevelItem>
          <ConditionalTooltip
            isTooltipEnabled={!hasCommonNetworkAdapters()}
            content={
              selectedItems.length === 0
                ? 'Select at least one host'
                : 'Selected hosts have no network adapters in common'
            }
          >
            <div>
              <Button
                variant="secondary"
                onClick={() => setIsSelectNetworkModalOpen(true)}
                isDisabled={!hasCommonNetworkAdapters()}
              >
                Select migration network
              </Button>
            </div>
          </ConditionalTooltip>
        </LevelItem>
        <LevelItem>
          <Pagination {...paginationProps} widgetId="providers-table-pagination-top" />
        </LevelItem>
      </Level>
      <Table
        className="provider-inner-hosts-table"
        aria-label={`Hosts table for provider ${provider.name}`}
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
          commonNetworkAdapters={commonNetworkAdapters(selectedItems)}
          hostConfigs={hostConfigs}
          provider={provider as IVMwareProvider}
          onClose={() => setIsSelectNetworkModalOpen(false)}
        />
      )}
    </>
  );
};

export default VMwareProviderHostsTable;
