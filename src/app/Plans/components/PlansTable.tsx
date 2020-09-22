import * as React from 'react';
import { Button, Level, LevelItem, Pagination, Progress } from '@patternfly/react-core';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';
import {
  Table,
  TableHeader,
  TableBody,
  ICell,
  IRow,
  sortable,
  wrappable,
} from '@patternfly/react-table';

import PlanStatus from './PlanStatus';
import PlanActionsDropdown from './PlanActionsDropdown';
import { useSortState, usePaginationState } from '@app/common/hooks';
import { IPlan, IMigration } from '@app/queries/types';

interface IPlansTableProps {
  plans: IPlan[];
  migrations: IMigration[];
}

const PlansTable: React.FunctionComponent<IPlansTableProps> = ({
  plans,
  migrations,
}: IPlansTableProps) => {
  const getSortValues = (plan: IPlan) => {
    return [
      plan.metadata.name,
      plan.spec.provider.sourceProvider.name,
      plan.spec.provider.destinationProvider.name,
      plan.spec.vmList.length,
      '', // Plan status
      '', // Action column
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(plans, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const getMigration = (plan) => migrations.filter((migration) => migration.plan === plan);

  const columns: ICell[] = [
    { title: 'Name', transforms: [sortable, wrappable] },
    { title: 'Source provider', transforms: [sortable, wrappable] },
    { title: 'Target provider', transforms: [sortable] },
    { title: 'VMs', transforms: [sortable] },
    { title: 'Plan status', transforms: [sortable] },
    { title: '' },
  ];

  const rows: IRow[] = [];

  currentPageItems.forEach((plan: IPlan) => {
    rows.push({
      meta: { plan },
      cells: [
        {
          title: (
            <>
              <a href="#">{plan.metadata.name}</a>
              <div>{plan.spec.description}</div>
            </>
          ),
        },
        plan.spec.provider.sourceProvider.name,
        plan.spec.provider.destinationProvider.name,
        plan.spec.vmList.length,
        {
          title: <PlanStatus plan={plan} migration={getMigration(plan)[0]} />,
        },
        { title: <PlanActionsDropdown /> },
      ],
    });
  });

  return (
    <>
      <Level>
        <LevelItem>
          <Button variant="primary" onClick={() => alert('TODO')} isDisabled={false}>
            Create
          </Button>
        </LevelItem>
        <LevelItem>
          <Pagination {...paginationProps} widgetId="plans-table-pagination-top" />
        </LevelItem>
      </Level>
      <Table
        aria-label="Migration Plans table"
        cells={columns}
        rows={rows}
        sortBy={sortBy}
        onSort={onSort}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <Pagination {...paginationProps} widgetId="plans-table-pagination-bottom" variant="bottom" />
    </>
  );
};

export default PlansTable;
