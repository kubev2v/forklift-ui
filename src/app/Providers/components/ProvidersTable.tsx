import * as React from 'react';
import { Pagination } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, sortable } from '@patternfly/react-table';
import { OutlinedHddIcon } from '@patternfly/react-icons';
import { ProviderType } from '@app/common/constants';
import { useSortState, usePaginationState } from '@app/common/hooks';
import StatusIcon, { StatusType } from '@app/common/components/StatusIcon';

interface IProvidersTableProps {
  providers: any[]; // TODO
  activeProviderType: ProviderType;
}

const ProvidersTable: React.FunctionComponent<IProvidersTableProps> = ({
  providers,
  activeProviderType,
}) => {
  const columns = [
    { title: 'Name', transforms: [sortable] },
    { title: 'Endpoint', transforms: [sortable] },
    { title: 'Clusters', transforms: [sortable] },
    { title: 'Hosts', transforms: [sortable] },
    { title: 'VMs', transforms: [sortable] },
    { title: 'Networks', transforms: [sortable] },
    { title: 'Datastores', transforms: [sortable] },
    { title: 'Status', transforms: [sortable] },
  ];

  const getSortValues = () => ['', '', '', '', '', '', '', ''];

  const { sortBy, onSort, sortedItems } = useSortState(providers, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy]); // TODO does it break if I add exhaustive deps here?

  const rows = currentPageItems.map((provider) => ({
    // TODO formatting from real data
    cells: [
      'VCenter1',
      'vdaddy',
      2,
      {
        title: (
          <>
            <OutlinedHddIcon /> 15
          </>
        ),
      },
      41,
      8,
      3,
      {
        title: (
          <>
            <StatusIcon status={StatusType.Ok} /> Ready
          </>
        ),
      },
    ],
  }));

  // TODO we're probably going to run into this same issue:
  // https://github.com/konveyor/mig-ui/blob/master/src/app/home/pages/PlansPage/components/Wizard/NamespacesTable.tsx#L71-L75
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onSelect = (event, isSelected, rowIndex, rowData) => {};

  return (
    <>
      <Pagination {...paginationProps} widgetId="providers-table-pagination-top" />
      <Table
        aria-label="Providers table"
        cells={columns}
        rows={rows}
        sortBy={sortBy}
        onSort={onSort}
        onSelect={onSelect}
        actions={[{ title: 'Some action', onClick: () => alert('TODO') }]}
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

export default ProvidersTable;
