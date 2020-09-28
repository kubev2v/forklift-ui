import * as React from 'react';
import { Button, Flex, FlexItem, Level, LevelItem, Pagination, Text } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  ICell,
  IRow,
  sortable,
  wrappable,
  classNames,
  cellWidth,
} from '@patternfly/react-table';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';
import { Link } from 'react-router-dom';

import PlanStatus from './PlanStatus';
import PlanActionsDropdown from './PlanActionsDropdown';
import { useSortState, usePaginationState } from '@app/common/hooks';
import { IPlan, IMigration } from '@app/queries/types';
import './PlansTable.css';
import PlanWizard from './Wizard/PlanWizard';
import { PlanStatusType } from '@app/common/constants';
import { ProgressVariant } from '@patternfly/react-core';

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

  const ratioVMs = (plan) => {
    const migration = getMigration(plan)[0];
    const totalVMs = plan.spec.vmList.length;

    const statusValue = totalVMs > 0 ? (migration.status.nbVMsDone * 100) / totalVMs : 0;
    const statusMessage = `${migration.status.nbVMsDone} of ${plan.spec.vmList.length} VMs migrated`;
    return { statusValue, statusMessage };
  };

  const columns: ICell[] = [
    { title: 'Name', transforms: [sortable, wrappable] },
    { title: 'Source provider', transforms: [sortable, wrappable] },
    { title: 'Target provider', transforms: [sortable, wrappable] },
    { title: 'VMs', transforms: [sortable] },
    { title: 'Plan status', transforms: [sortable, cellWidth(30)] },
    {
      title: '',
      transforms: [cellWidth(10)],
      columnTransforms: [classNames(alignment.textAlignRight)],
    },
  ];

  const rows: IRow[] = [];

  currentPageItems.forEach((plan: IPlan) => {
    let buttonText: string | React.ReactNode;
    let variant: ProgressVariant | undefined;
    let title = '';
    let isReady = false;

    if (plan.status.conditions.every((condition) => condition.type === 'Ready')) {
      buttonText = 'Start';
      isReady = true;
    } else if (plan.status.conditions.every((condition) => condition.type === 'Finished')) {
      title = PlanStatusType.finished;
      variant = ProgressVariant.success;
    } else if (plan.status.conditions.find((condition) => condition.type === 'Error')) {
      title = PlanStatusType.error;
      variant = ProgressVariant.danger;
    } else {
      title = PlanStatusType.running;
    }

    const { statusValue = 0, statusMessage = '' } = ratioVMs(plan);

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
          title: (
            <PlanStatus
              isReady={isReady}
              title={title}
              variant={variant}
              value={statusValue}
              message={statusMessage}
            />
          ),
        },
        {
          title: buttonText ? (
            <>
              <Flex
                flex={{ default: 'flex_2' }}
                spaceItems={{ default: 'spaceItemsNone' }}
                alignItems={{ default: 'alignItemsCenter' }}
                flexWrap={{ default: 'nowrap' }}
              >
                <FlexItem align={{ default: 'alignRight' }}>
                  <Button variant="secondary" onClick={() => alert('TODO')} isDisabled={false}>
                    {buttonText}
                  </Button>
                </FlexItem>
                <FlexItem>
                  <PlanActionsDropdown />
                </FlexItem>
              </Flex>
            </>
          ) : (
            <PlanActionsDropdown />
          ),
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
