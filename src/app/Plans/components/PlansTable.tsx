import * as React from 'react';
import {
  Button,
  Flex,
  FlexItem,
  Level,
  LevelItem,
  Pagination,
  Progress,
  ProgressMeasureLocation,
  ProgressVariant,
  Text,
} from '@patternfly/react-core';
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
import { StatusIcon, StatusType } from '@konveyor/lib-ui';

import PlanActionsDropdown from './PlanActionsDropdown';
import { useSortState, usePaginationState } from '@app/common/hooks';
import { IPlan, IMigration } from '@app/queries/types';
import './PlansTable.css';
import { PlanStatusType, PlanStatusConditionsType } from '@app/common/constants';

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
      plan.spec.vms.length,
      '', // Plan status
      '', // Action column
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(plans, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const getMigration = (plan: IPlan) => migrations.filter((migration) => migration.plan === plan);

  const ratioVMs = (plan: IPlan) => {
    const migration = getMigration(plan)[0];
    const totalVMs = plan.spec.vms.length;
    const statusValue = totalVMs > 0 ? (migration.status.nbVMsDone * 100) / totalVMs : 0;
    const statusMessage = `${migration.status.nbVMsDone} of ${plan.spec.vms.length} VMs migrated`;

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
    let isStatusReady = false;
    let title = '';
    let variant: ProgressVariant | undefined;

    const hasCondition = (type: string) => {
      return plan.status.conditions.find((condition) => condition.type === type);
    };

    if (hasCondition(PlanStatusConditionsType.Ready)) {
      buttonText = 'Start';
      isStatusReady = true;
    } else if (hasCondition(PlanStatusConditionsType.Finished)) {
      title = PlanStatusType.Finished;
      variant = ProgressVariant.success;
    } else if (hasCondition(PlanStatusConditionsType.Error)) {
      title = PlanStatusType.Error;
      variant = ProgressVariant.danger;
    } else {
      buttonText = 'Cancel';
      title = PlanStatusType.Running;
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
        plan.spec.vms.length,
        {
          title: isStatusReady ? (
            <StatusIcon status={StatusType.Ok} label={PlanStatusType.Ready} />
          ) : (
            <Progress
              title={title}
              value={statusValue}
              label={statusMessage}
              valueText={statusMessage}
              variant={variant}
              measureLocation={ProgressMeasureLocation.top}
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
                  <PlanActionsDropdown conditions={plan.status.conditions} />
                </FlexItem>
              </Flex>
            </>
          ) : (
            <PlanActionsDropdown conditions={plan.status.conditions} />
          ),
        },
      ],
    });
  });

  return (
    <>
      <Level>
        <LevelItem>
          <Link to="/plans/create">
            <Button variant="secondary">Create</Button>
          </Link>
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
    </>
  );
};

export default PlansTable;
