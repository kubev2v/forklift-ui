import * as React from 'react';
import { Checkbox } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  sortable,
  classNames as classNamesTransform,
} from '@patternfly/react-table';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';
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
    {
      // TODO maybe onSelect was fine here?
      // Using a custom column instead of Table's onSelect prop due to issues
      title: (
        <Checkbox
          id="select-all-checkbox"
          aria-label="Select all providers"
          isChecked={false} // TODO
          onChange={(checked) => alert('TODO')}
        />
      ),
      columnTransforms: [classNamesTransform(tableStyles.tableCheck)],
    },
    { title: 'Name', transforms: [sortable] },
    { title: 'Network for migration data transfer', transforms: [sortable] },
    { title: 'Bandwidth', transforms: [sortable] },
    { title: 'MTU', transforms: [sortable] },
  ];

  const getSortValues = () => ['', '', '', '']; // TODO
  const { sortBy, onSort, sortedItems } = useSortState(hosts, getSortValues);

  const rows = sortedItems.map((host) => ({
    // TODO formatting from real data
    cells: [
      {
        title: (
          <Checkbox
            id="select-provider-NAME" // TODO
            aria-label="Select provider NAME" // TODO
            isChecked={false} // TODO
            onChange={(checked) => alert('TODO')}
          />
        ),
      },
      'host1',
      'management network - 192.168.0.0/24 (default)',
      '1 GB / s',
      '1499',
    ],
  }));

  return (
    <Table
      variant="compact"
      aria-label="Hosts table for provider NAME" // TODO
      cells={columns}
      rows={rows}
      sortBy={sortBy}
      onSort={onSort}
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};

export default ProviderHostsTable;
