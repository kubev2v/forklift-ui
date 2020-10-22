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
import { PlanStatusType, StatusConditionsType } from '@app/common/constants';
import CreatePlanButton from './CreatePlanButton';
import { FilterToolbar, FilterType, FilterCategory } from '@app/common/components/FilterToolbar';
import { useFilterState } from '@app/common/hooks/useFilterState';
import { hasCondition } from '@app/common/helpers';
import TableEmptyState from '@app/common/components/TableEmptyState';

import './PlansTable.css';

interface IPlansTableProps {
  plans: IPlan[];
  migrations: IMigration[];
}

const PlansTable: React.FunctionComponent<IPlansTableProps> = ({
  plans,
  migrations,
}: IPlansTableProps) => {
  const filterCategories: FilterCategory<IPlan>[] = [
    {
      key: 'name',
      title: 'Name',
      type: FilterType.search,
      placeholderText: 'Filter by name...',
      getItemValue: (item) => {
        return item.metadata.name;
      },
    },
    {
      key: 'sourceProvider',
      title: 'Source provider',
      type: FilterType.search,
      placeholderText: 'Filter by name...',
      getItemValue: (item) => {
        return item.spec.provider.sourceProvider.name;
      },
    },
    {
      key: 'targetProvider',
      title: 'Target provider',
      type: FilterType.search,
      placeholderText: 'Filter by name...',
      getItemValue: (item) => {
        return item.spec.provider.destinationProvider.name;
      },
    },
    {
      key: 'status',
      title: 'Status',
      type: FilterType.search,
      placeholderText: 'Filter state...',
      getItemValue: (item) => {
        const res = item.status.conditions.find(
          (condition) =>
            condition.type === PlanStatusType.Ready ||
            condition.type === PlanStatusType.Execute ||
            condition.type === PlanStatusType.Finished ||
            condition.type === PlanStatusType.Error
        );
        return res ? StatusConditionsType[res.type] : '';
      },
    },
  ];

  const { filterValues, setFilterValues, filteredItems } = useFilterState(plans, filterCategories);
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

  const { sortBy, onSort, sortedItems } = useSortState(filteredItems, getSortValues);
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

    if (hasCondition(plan.status.conditions, StatusConditionsType.Ready)) {
      buttonText = 'Start';
      isStatusReady = true;
    } else if (hasCondition(plan.status.conditions, StatusConditionsType.Finished)) {
      title = PlanStatusType.Finished;
      variant = ProgressVariant.success;
    } else if (hasCondition(plan.status.conditions, StatusConditionsType.Error)) {
      title = PlanStatusType.Error;
      variant = ProgressVariant.danger;
    } else {
      buttonText = 'Cancel';
      title = PlanStatusType.Execute;
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
          <Flex>
            <FlexItem
              alignSelf={{ default: 'alignSelfFlexStart' }}
              spacer={{ default: 'spacerNone' }}
            >
              <FilterToolbar<IPlan>
                filterCategories={filterCategories}
                filterValues={filterValues}
                setFilterValues={setFilterValues}
              />
            </FlexItem>
            <FlexItem>
              <CreatePlanButton variant="secondary" label="Create" />
            </FlexItem>
          </Flex>
        </LevelItem>
        <LevelItem>
          <Pagination {...paginationProps} widgetId="plans-table-pagination-top" />
        </LevelItem>
      </Level>
      {filteredItems.length > 0 ? (
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
      ) : (
        <TableEmptyState
          titleText="No migration plans found"
          bodyText="No results match your filter. Go back and make a different selection."
        />
      )}
      <Pagination {...paginationProps} widgetId="plans-table-pagination-bottom" variant="bottom" />
    </>
  );
};

export default PlansTable;
