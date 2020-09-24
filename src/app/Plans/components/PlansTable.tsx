import * as React from 'react';
import { Button, Flex, Level, LevelItem, Pagination, Text } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  ICell,
  IRow,
  sortable,
  wrappable,
} from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import PlanStatus from './PlanStatus';
import PlanActionsDropdown from './PlanActionsDropdown';
import { useSortState, usePaginationState } from '@app/common/hooks';
import { IPlan, IMigration } from '@app/queries/types';
import './PlansTable.css';
import PlanWizard from './Wizard/PlanWizard';

interface IPlansTableProps {
  plans: IPlan[];
  migrations: IMigration[];
}

const PlansTable: React.FunctionComponent<IPlansTableProps> = ({
  plans,
  migrations,
}: IPlansTableProps) => {
  const [isWizardOpen, toggleWizard] = React.useReducer((isWizardOpen) => !isWizardOpen, false);

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
    let buttonText = '';
    if (plan.status.conditions.every((condition) => condition.type === 'Ready')) {
      buttonText = 'Start migration';
    }

    rows.push({
      meta: { plan },
      cells: [
        {
          title: (
            <>
              <Link to={`/plans/${plan.metadata.name}`}>{plan.metadata.name}</Link>
              <Flex>
                <Text component="small">{plan.spec.description}</Text>
              </Flex>
            </>
          ),
        },
        plan.spec.provider.sourceProvider.name,
        plan.spec.provider.destinationProvider.name,
        plan.spec.vmList.length,
        {
          title: <PlanStatus plan={plan} migration={getMigration(plan)[0]} />,
        },
        {
          title: buttonText ? (
            <>
              <Button variant="secondary" onClick={() => alert('TODO')} isDisabled={false}>
                {buttonText}
              </Button>
              <PlanActionsDropdown />
            </>
          ) : null,
        },
      ],
    });
  });

  return (
    <>
      <Level>
        <LevelItem>
          <Button variant="secondary" onClick={toggleWizard} isDisabled={false}>
            Create
          </Button>
        </LevelItem>
        <LevelItem>
          <Pagination {...paginationProps} widgetId="plans-table-pagination-top" />
        </LevelItem>
      </Level>
      <Table
        aria-label="Migration Plans table"
        className="plans-table"
        cells={columns}
        rows={rows}
        sortBy={sortBy}
        onSort={onSort}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <Pagination {...paginationProps} widgetId="plans-table-pagination-bottom" variant="bottom" />
      {isWizardOpen ? (
        <PlanWizard onClose={toggleWizard} sourceProviders={[]} targetProviders={[]} />
      ) : null}
    </>
  );
};

export default PlansTable;
