import * as React from 'react';
import { Pagination, Button } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  sortable,
  compoundExpand,
  classNames as classNamesTransform,
} from '@patternfly/react-table';
import { OutlinedHddIcon } from '@patternfly/react-icons';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';

import { ProviderType } from '@app/common/constants';
import { useSortState, usePaginationState } from '@app/common/hooks';
import StatusIcon, { StatusType } from '@app/common/components/StatusIcon';
import ProviderActionsDropdown from './ProviderActionsDropdown';
import ProviderHostsTable from './ProviderHostsTable';

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
    { title: 'Hosts', transforms: [sortable], cellTransforms: [compoundExpand] },
    { title: 'VMs', transforms: [sortable] },
    { title: 'Networks', transforms: [sortable] },
    { title: 'Datastores', transforms: [sortable] },
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
      isOpen: true,
      cells: [
        'VCenter1',
        'fooendpoint',
        2,
        {
          title: (
            <>
              <OutlinedHddIcon key="hosts-icon" /> 15
            </>
          ),
          props: { isOpen: true, ariaControls: 'provider-0-hosts-expanded' },
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
        {
          title: <ProviderActionsDropdown />,
        },
      ],
    },
    {
      parent: 0,
      compoundExpand: 3,
      cells: [
        {
          // TODO WTF do we do about the first cell in this row.
          //   It's added automatically because of the `onSelect`, as a checkbox row, but it's empty?
          //   It screws up the spacing of the inner table. There doesn't seem to be a way to remove it.
          //   I think we'll have to remove the onSelect prop of Table and implement our own checkbox row...
          //   TODO: open an issue on patternfly for this
          title: (
            <div className={`${spacing.myMd}`}>
              <div className={`${alignment.textAlignRight} ${spacing.mrSm}`}>
                <Button variant="secondary" onClick={() => alert('TODO')}>
                  Select migration network
                </Button>
              </div>
              <ProviderHostsTable
                id="provider-0-hosts-expanded"
                hosts={[{}, {}]} // TODO use real data from the provider object
              />
            </div>
          ),
          props: { colSpan: columns.length + 1, className: tableStyles.modifiers.noPadding },
        },
      ],
    },
  ]);

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
