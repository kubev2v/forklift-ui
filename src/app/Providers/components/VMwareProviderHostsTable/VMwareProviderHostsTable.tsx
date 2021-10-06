import * as React from 'react';
import { Button, Level, LevelItem, Pagination } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  sortable,
  ICell,
  IRow,
  cellWidth,
  truncate,
} from '@patternfly/react-table';
import { usePaginationState, useSortState } from '@app/common/hooks';
import { useSelectionState } from '@konveyor/lib-ui';
import { IHost, IVMwareProvider } from '@app/queries/types';
import SelectNetworkModal from './SelectNetworkModal';
import { useHostConfigsQuery } from '@app/queries';
import { findHostConfig, findSelectedNetworkAdapter, formatHostNetworkAdapter } from './helpers';
import ConditionalTooltip from '@app/common/components/ConditionalTooltip';
import { ResolvedQuery } from '@app/common/components/ResolvedQuery';
import { getMostSeriousCondition } from '@app/common/helpers';
import StatusCondition from '@app/common/components/StatusCondition';
import '@app/Providers/components/VMwareProviderHostsTable/VMwareProviderHostsTable.css';

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
    { title: 'Name', transforms: [sortable], cellTransforms: [truncate] },
    {
      title: 'Network for migration data transfer',
      transforms: [sortable, cellWidth(30)],
      cellTransforms: [truncate],
    },
    { title: 'Bandwidth', transforms: [sortable], cellTransforms: [truncate] },
    { title: 'MTU', transforms: [sortable], cellTransforms: [truncate] },
    { title: 'Status', transforms: [sortable], cellTransforms: [truncate] },
  ];

  const getCells = (host: IHost) => {
    const hostConfig = findHostConfig(host, hostConfigs, provider);
    const networkAdapter = findSelectedNetworkAdapter(host, hostConfig);
    return [
      host.name,
      networkAdapter ? formatHostNetworkAdapter(networkAdapter) : '(default)',
      networkAdapter ? `${networkAdapter.linkSpeed} Mbps` : '',
      networkAdapter?.mtu || '',
      {
        title: (
          <StatusCondition
            status={hostConfig?.status}
            unknownFallback={hostConfig ? 'Pending' : ''}
          />
        ),
      },
    ];
  };

  const getSortValues = (host: IHost) => {
    const hostConfig = findHostConfig(host, hostConfigs, provider);
    const cells = getCells(host);
    return [
      '', // Checkbox column
      ...(cells.slice(0, -1) as string[]),
      hostConfig?.status ? getMostSeriousCondition(hostConfig?.status?.conditions) : '',
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(hosts, getSortValues);
  const { paginationProps } = usePaginationState(sortedItems, 10);
  const { selectedItems, isItemSelected, toggleItemSelected, selectAll } = useSelectionState<IHost>(
    {
      items: sortedItems,
      isEqual: (a, b) => a.id === b.id,
    }
  );

  const commonNetworkAdapters =
    selectedItems.length > 0
      ? selectedItems[0].networkAdapters.filter(({ name }) =>
          selectedItems.every((host) => host.networkAdapters.some((na) => na.name === name))
        )
      : [];

  const rows: IRow[] = sortedItems.map((host: IHost) => ({
    meta: { host },
    selected: isItemSelected(host),
    cells: getCells(host),
  }));

  const [isSelectNetworkModalOpen, setIsSelectNetworkModalOpen] = React.useState(false);

  return (
    <ResolvedQuery result={hostConfigsQuery} errorTitle="Cannot load host configurations">
      <Level>
        <LevelItem>
          <ConditionalTooltip
            isTooltipEnabled={commonNetworkAdapters.length === 0}
            content={
              selectedItems.length === 0
                ? 'Select at least one host'
                : 'Selected hosts have no networks in common'
            }
          >
            <div>
              <Button
                variant="secondary"
                onClick={() => setIsSelectNetworkModalOpen(true)}
                isDisabled={commonNetworkAdapters.length === 0}
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
        variant="compact"
        className="provider-inner-hosts-table"
        aria-label={`Hosts table for provider ${provider.name}`}
        cells={columns}
        rows={rows}
        sortBy={sortBy}
        onSort={onSort}
        onSelect={(_event, isSelected, rowIndex, rowData) => {
          if (rowIndex === -1) {
            selectAll(isSelected);
          } else {
            toggleItemSelected(rowData.meta.host, isSelected);
          }
        }}
      >
        <TableHeader />
        <TableBody />
      </Table>
      {isSelectNetworkModalOpen && (
        <SelectNetworkModal
          selectedHosts={selectedItems}
          commonNetworkAdapters={commonNetworkAdapters}
          hostConfigs={hostConfigs}
          provider={provider as IVMwareProvider}
          onClose={() => setIsSelectNetworkModalOpen(false)}
        />
      )}
    </ResolvedQuery>
  );
};

export default VMwareProviderHostsTable;
