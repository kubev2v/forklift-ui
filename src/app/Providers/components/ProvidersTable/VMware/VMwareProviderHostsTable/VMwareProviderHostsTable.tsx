import * as React from 'react';
import { Button } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, sortable, ICell, IRow } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';
import { useSortState } from '@app/common/hooks';
import { useSelectionState } from '@konveyor/lib-ui';
import { IVMwareProvider, IHost } from '@app/queries/types';
import { MOCK_HOSTS_BY_PROVIDER } from '@app/queries/mocks/hosts.mock';
import { formatHostNetwork } from './helpers';
import SelectNetworkModal from './SelectNetworkModal';

interface IVMwareProviderHostsTableProps {
  provider: IVMwareProvider;
}

// TODO use real data instead of mocks
const hostsByProvider = MOCK_HOSTS_BY_PROVIDER;

const VMwareProviderHostsTable: React.FunctionComponent<IVMwareProviderHostsTableProps> = ({
  provider,
}: IVMwareProviderHostsTableProps) => {
  const hosts: IHost[] = hostsByProvider[provider.metadata.name];

  const columns: ICell[] = [
    { title: 'Name', transforms: [sortable] },
    { title: 'Network for migration data transfer', transforms: [sortable] },
    { title: 'Bandwidth', transforms: [sortable] },
    { title: 'MTU', transforms: [sortable] },
  ];

  const getSortValues = (host: IHost) => {
    const { name, network, bandwidth, mtu } = host.metadata;
    // First cell is the generated checkbox from using onSelect.
    return ['', name, formatHostNetwork(network), bandwidth, mtu];
  };
  const { sortBy, onSort, sortedItems } = useSortState(hosts, getSortValues);

  const { selectedItems, toggleItemSelected, selectAll } = useSelectionState<IHost>({
    items: sortedItems,
  });

  const rows: IRow[] = sortedItems.map((host: IHost) => {
    const { name, bandwidth, mtu } = host.metadata;
    return {
      meta: { host },
      selected: selectedItems.includes(host),
      cells: [name, formatHostNetwork(host.metadata.network), bandwidth, mtu],
    };
  });

  const [isSelectNetworkModalOpen, setIsSelectNetworkModalOpen] = React.useState(false);

  return (
    <>
      <div className={`${alignment.textAlignRight} ${spacing.mtSm} ${spacing.mrSm}`}>
        <Button
          variant="secondary"
          onClick={() => setIsSelectNetworkModalOpen(true)}
          isDisabled={selectedItems.length === 0}
        >
          Select migration network
        </Button>
      </div>
      <Table
        className="provider-inner-hosts-table"
        variant="compact"
        aria-label={`Hosts table for provider ${provider.metadata.name}`}
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
  );
};

export default VMwareProviderHostsTable;
