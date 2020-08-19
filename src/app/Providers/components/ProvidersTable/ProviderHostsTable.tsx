import * as React from 'react';
import { Table, TableHeader, TableBody, sortable } from '@patternfly/react-table';
import { useSortState } from '@app/common/hooks';

interface IProviderHostsTableProps {
  id: string;
  hosts: any[]; // TODO
}

const ProviderHostsTable: React.FunctionComponent<IProviderHostsTableProps> = ({
  id,
  hosts,
}: IProviderHostsTableProps) => {
  const columns = [
    { title: 'Name', transforms: [sortable] },
    { title: 'Network for migration data transfer', transforms: [sortable] },
    { title: 'Bandwidth', transforms: [sortable] },
    { title: 'MTU', transforms: [sortable] },
  ];

  const getSortValues = () => ['', '', '', '']; // TODO
  const { sortBy, onSort, sortedItems } = useSortState(hosts, getSortValues);

  const rows = sortedItems.map((host) => ({
    // TODO formatting from real data
    cells: ['host1', 'management network - 192.168.0.0/24 (default)', '1 GB / s', '1499'],
  }));

  // TODO we're probably going to run into this same issue:
  // https://github.com/konveyor/mig-ui/blob/master/src/app/home/pages/PlansPage/components/Wizard/NamespacesTable.tsx#L71-L75
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onSelect = (event, isSelected, rowIndex, rowData) => {};

  return (
    <Table
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
  );
};

export default ProviderHostsTable;
