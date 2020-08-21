import * as React from 'react';
import { Pagination, List, ListItem } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  sortable,
  compoundExpand,
  classNames as classNamesTransform,
  ICell,
} from '@patternfly/react-table';
import { DatabaseIcon } from '@patternfly/react-icons';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';
import { useSortState, usePaginationState } from '@app/common/hooks';
import CNVProviderActionsDropdown from './CNVProviderActionsDropdown';
import StatusIcon, { StatusType } from '@app/common/components/StatusIcon';

interface ICNVProvidersTableProps {
  providers: any[]; // TODO
}

const CNVProvidersTable: React.FunctionComponent<ICNVProvidersTableProps> = ({
  providers,
}: ICNVProvidersTableProps) => {
  const columns: ICell[] = [
    { title: 'Name', transforms: [sortable] },
    { title: 'Endpoint', transforms: [sortable] },
    { title: 'Namespaces', transforms: [sortable] },
    { title: 'VMs', transforms: [sortable] },
    { title: 'Networks', transforms: [sortable] },
    { title: 'Storage classes', transforms: [sortable], cellTransforms: [compoundExpand] },
    { title: 'Status', transforms: [sortable] },
    { title: '', columnTransforms: [classNamesTransform(tableStyles.tableAction)] },
  ];

  const getSortValues = () => ['', '', '', '', '', '', '', '']; // TODO

  const { sortBy, onSort, sortedItems } = useSortState(providers, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy]); // TODO does it break if I add exhaustive deps here?

  const rows = currentPageItems.flatMap((provider) => [
    {
      // TODO formatting from real data
      cells: [
        'my_OCPv_cluster1',
        'https://my_OCPv_url',
        '41',
        '26',
        '8',
        {
          title: (
            <>
              <DatabaseIcon key="storage-classes-icon" /> 3
            </>
          ),
          props: { isOpen: true, ariaControls: 'provider-0-storage-classes-expanded' },
        },
        {
          title: (
            <>
              <StatusIcon status={StatusType.Ok} /> Ready
            </>
          ),
        },
        { title: <CNVProviderActionsDropdown /> },
      ],
    },
    {
      // TODO actually handle expand state, maybe don't render these rows at all when collapsed?
      parent: 0,
      compoundExpand: 5,
      cells: [
        {
          title: (
            <List>
              <ListItem>gold</ListItem>
              <ListItem>silver</ListItem>
              <ListItem>bronze</ListItem>
            </List>
          ),
          props: { colSpan: columns.length, className: tableStyles.modifiers.noPadding },
        },
      ],
    },
  ]);

  return (
    <>
      <Pagination {...paginationProps} widgetId="providers-table-pagination-top" />
      <Table
        aria-label="OpenShift virtualization providers table"
        cells={columns}
        rows={rows}
        sortBy={sortBy}
        onSort={onSort}
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

export default CNVProvidersTable;
