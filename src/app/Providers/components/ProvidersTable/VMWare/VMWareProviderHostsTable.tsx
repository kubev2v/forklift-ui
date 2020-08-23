import * as React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  sortable,
  ICell,
  IRow,
  TableProps,
} from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';
import { useSortState, useSelectionState } from '@app/common/hooks';
import { IVMWareProvider, IHost } from '@app/Providers/types';
import { MOCK_HOSTS_BY_PROVIDER } from '@app/Providers/mocks/hosts.mock';
import { formatHostNetwork } from './helpers';
import { Button } from '@patternfly/react-core';

interface IVMWareProviderHostsTableProps {
  provider: IVMWareProvider;
}

// TODO use real data instead of mocks
const hostsByProvider = MOCK_HOSTS_BY_PROVIDER;

const VMWareProviderHostsTable: React.FunctionComponent<IVMWareProviderHostsTableProps> = ({
  provider,
}: IVMWareProviderHostsTableProps) => {
  const hosts: IHost[] = hostsByProvider[provider.metadata.name];

  const columns: ICell[] = [
    { title: 'Name', transforms: [sortable] },
    { title: 'Network for migration data transfer', transforms: [sortable] },
    { title: 'Bandwidth', transforms: [sortable] },
    { title: 'MTU', transforms: [sortable] },
  ];

  const getSortValues = (host: IHost) => {
    const { name, bandwidth, mtu } = host.metadata;
    // First cell is the generated checkbox from using onSelect.
    return ['', name, formatHostNetwork(host), bandwidth, mtu];
  };
  const { sortBy, onSort, sortedItems } = useSortState(hosts, getSortValues);

  const { selectedItems, toggleItemSelected, selectAll } = useSelectionState<IHost>(sortedItems);

  const rows: IRow[] = sortedItems.map((host: IHost) => {
    const { name, bandwidth, mtu } = host.metadata;
    return {
      meta: { host },
      selected: selectedItems.includes(host),
      cells: [name, formatHostNetwork(host), bandwidth, mtu],
    };
  });

  // TODO we're probably going to run into this same issue:
  // https://github.com/konveyor/mig-ui/blob/master/src/app/home/pages/PlansPage/components/Wizard/NamespacesTable.tsx#L71-L75
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onSelect: TableProps['onSelect'] = (_event, isSelected, rowIndex, rowData) => {
    if (rowIndex === -1) {
      selectAll(isSelected);
    }
    toggleItemSelected(rowData.meta.host, isSelected);
  };

  return (
    <>
      <div className={`${alignment.textAlignRight} ${spacing.mtSm} ${spacing.mrSm}`}>
        <Button
          variant="secondary"
          onClick={() => alert('TODO')}
          isDisabled={selectedItems.length === 0}
        >
          Select migration network
        </Button>
      </div>
      <Table
        className="provider-inner-hosts-table"
        variant="compact"
        aria-label="Hosts table for provider NAME" // TODO
        cells={columns}
        rows={rows}
        sortBy={sortBy}
        onSort={onSort}
        onSelect={onSelect}
      >
        <TableHeader />
        <TableBody />
      </Table>
    </>
  );
};

export default VMWareProviderHostsTable;
