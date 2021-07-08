import * as React from 'react';
import {
  Flex,
  FlexItem,
  Pagination,
  Progress,
  ProgressMeasureLocation,
  Text,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  ICell,
  IRow,
  sortable,
  expandable,
  classNames,
  cellWidth,
  TableComposable,
  Tbody,
  Td,
  Th,
  Tr,
  truncate,
} from '@patternfly/react-table';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Link } from 'react-router-dom';
import { useSelectionState } from '@konveyor/lib-ui';

import PlanActionsDropdown from './PlanActionsDropdown';
import { useSortState, usePaginationState } from '@app/common/hooks';
import { IPlan } from '@app/queries/types';
import CreatePlanButton from '@app/Plans/components/CreatePlanButton';
import { FilterToolbar, FilterType, FilterCategory } from '@app/common/components/FilterToolbar';
import { useFilterState } from '@app/common/hooks/useFilterState';
import { hasCondition } from '@app/common/helpers';
import TableEmptyState from '@app/common/components/TableEmptyState';
import {
  findLatestMigration,
  findProvidersByRefs,
  useInventoryProvidersQuery,
  useMigrationsQuery,
} from '@app/queries';

import './PlansTable.css';
import { getPlanStatusTitle, getPlanState, getButtonState, getMigStatusState } from './helpers';
import { isSameResource } from '@app/queries/helpers';
import StatusCondition from '@app/common/components/StatusCondition';
import MigrateOrCutoverButton from './MigrateOrCutoverButton';
import PlanStatusNavLink from './PlanStatusNavLink';

export type PlanActionButtonType = 'Start' | 'Restart' | 'Cutover';
interface IPlansTableProps {
  plans: IPlan[];
  errorContainerRef: React.RefObject<HTMLDivElement>;
}

const PlansTable: React.FunctionComponent<IPlansTableProps> = ({
  plans,
  errorContainerRef,
}: IPlansTableProps) => {
  const providersQuery = useInventoryProvidersQuery();
  const migrationsQuery = useMigrationsQuery();
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
      key: 'type',
      title: 'Type',
      type: FilterType.select,
      placeholderText: 'Filter by type...',
      selectOptions: [
        { key: 'Cold', value: 'Cold' },
        { key: 'Warm', value: 'Warm' },
      ],
      getItemValue: (item) => {
        return item.spec.warm ? 'Warm' : 'Cold';
      },
    },
    {
      key: 'sourceProvider',
      title: 'Source provider',
      type: FilterType.search,
      placeholderText: 'Filter by name...',
      getItemValue: (item) => {
        const { sourceProvider } = findProvidersByRefs(item.spec.provider, providersQuery);
        return sourceProvider?.name || '';
      },
    },
    {
      key: 'targetProvider',
      title: 'Target provider',
      type: FilterType.search,
      placeholderText: 'Filter by name...',
      getItemValue: (item) => {
        const { targetProvider } = findProvidersByRefs(item.spec.provider, providersQuery);
        return targetProvider?.name || '';
      },
    },
    {
      key: 'status',
      title: 'Status',
      type: FilterType.select,
      selectOptions: [
        { key: 'Failed', value: 'Failed' },
        { key: 'Ready', value: 'Ready' },
        { key: 'Running', value: 'Running' },
        { key: 'Succeeded', value: 'Succeeded' },
      ],
      getItemValue: (item) => {
        if (item.status?.conditions) {
          if (hasCondition(item.status.conditions, 'Failed')) return 'Failed';
          if (hasCondition(item.status.conditions, 'Ready')) return 'Ready';
          if (hasCondition(item.status.conditions, 'Executing')) return 'Running';
          if (hasCondition(item.status.conditions, 'Succeeded')) return 'Succeeded';
        }
        return '';
      },
    },
  ];

  const { filterValues, setFilterValues, filteredItems } = useFilterState(plans, filterCategories);
  const getSortValues = (plan: IPlan) => [
    '', // Expand/collapse column
    plan.metadata.name,
    plan.spec.warm,
    getPlanStatusTitle(plan),
    '', // Action column
  ];

  const { sortBy, onSort, sortedItems } = useSortState(filteredItems, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const { toggleItemSelected: togglePlanExpanded, isItemSelected: isPlanExpanded } =
    useSelectionState<IPlan>({
      items: sortedItems,
      isEqual: (a, b) => isSameResource(a.metadata, b.metadata),
    });

  const ratioVMs = (plan: IPlan) => {
    const totalVMs = plan.spec.vms.length;
    const numVMsDone =
      plan.status?.migration?.vms?.filter(
        (vm) =>
          !!vm.completed &&
          !vm.error &&
          !vm.conditions?.find((condition) => condition.type === 'Canceled')
      ).length || 0;
    const statusValue = totalVMs > 0 ? (numVMsDone * 100) / totalVMs : 0;
    const statusMessage = `${numVMsDone} of ${totalVMs} VMs migrated`;

    return { statusValue, statusMessage };
  };

  const columns: ICell[] = [
    {
      title: 'Name',
      transforms: [sortable, cellWidth(20)],
      cellFormatters: [expandable],
    },
    {
      title: 'Type',
      transforms: [sortable, cellWidth(10)],
      cellTransforms: [truncate],
    },
    {
      title: 'Plan status',
      transforms: [sortable, cellWidth(60)],
      cellTransforms: [truncate],
    },
    {
      title: '',
      transforms: [cellWidth(10)],
      columnTransforms: [classNames(alignment.textAlignRight, spacing.pxSm)],
    },
  ];

  const rows: IRow[] = [];

  currentPageItems.forEach((plan: IPlan) => {
    const latestMigration = findLatestMigration(plan, migrationsQuery.data?.items || null);
    const isWarmPlan = plan.spec.warm;

    const planState = getPlanState(plan, latestMigration, migrationsQuery);
    const buttonType = getButtonState(planState);
    const { title, variant } = getMigStatusState(planState, isWarmPlan);

    const { statusValue = 0, statusMessage = '' } = ratioVMs(plan);

    const { sourceProvider, targetProvider } = findProvidersByRefs(
      plan.spec.provider,
      providersQuery
    );

    const isExpanded = isPlanExpanded(plan);

    const isBeingStarted = planState === 'Starting';

    rows.push({
      meta: { plan },
      isOpen: isExpanded,
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
        isWarmPlan ? 'Warm' : 'Cold',
        {
          title:
            isBeingStarted && !isWarmPlan ? (
              <PlanStatusNavLink plan={plan}>Running - preparing for migration</PlanStatusNavLink>
            ) : isBeingStarted && isWarmPlan ? (
              <PlanStatusNavLink plan={plan}>
                Running - preparing for incremental data copies
              </PlanStatusNavLink>
            ) : planState === 'NotStarted' ? (
              <StatusCondition status={plan.status} />
            ) : planState === 'Copying' ? (
              <PlanStatusNavLink plan={plan}>
                Running - performing incremental data copies
              </PlanStatusNavLink>
            ) : planState === 'StartingCutover' ? (
              <PlanStatusNavLink plan={plan}>Running - preparing for cutover</PlanStatusNavLink>
            ) : (
              <PlanStatusNavLink plan={plan} isInline={false}>
                <Progress
                  title={title}
                  value={statusValue}
                  label={statusMessage}
                  valueText={statusMessage}
                  variant={variant}
                  measureLocation={ProgressMeasureLocation.top}
                />
              </PlanStatusNavLink>
            ),
        },
        {
          title: buttonType ? (
            <>
              <Flex
                flex={{ default: 'flex_2' }}
                spaceItems={{ default: 'spaceItemsNone' }}
                alignItems={{ default: 'alignItemsCenter' }}
                flexWrap={{ default: 'nowrap' }}
              >
                <FlexItem align={{ default: 'alignRight' }}>
                  <MigrateOrCutoverButton
                    plan={plan}
                    buttonType={buttonType}
                    isBeingStarted={isBeingStarted}
                    errorContainerRef={errorContainerRef}
                  />
                </FlexItem>
                <FlexItem>
                  <PlanActionsDropdown plan={plan} />
                </FlexItem>
              </Flex>
            </>
          ) : !isBeingStarted ? (
            <PlanActionsDropdown plan={plan} />
          ) : null,
        },
      ],
    });
    if (isExpanded) {
      rows.push({
        parent: rows.length - 1,
        cells: [
          {
            title: (
              <TableComposable
                aria-label={`Expanded details of plan ${plan.metadata.name}`}
                variant="compact"
                borders={false}
                className="expanded-content"
              >
                <Tbody>
                  <Tr>
                    <Th modifier="fitContent">Source provider</Th>
                    <Td>{sourceProvider?.name || ''}</Td>
                  </Tr>
                  <Tr>
                    <Th modifier="fitContent">Target provider</Th>
                    <Td>{targetProvider?.name || ''}</Td>
                  </Tr>
                  <Tr>
                    <Th modifier="fitContent">VMs</Th>
                    <Td>{plan.spec.vms.length}</Td>
                  </Tr>
                </Tbody>
              </TableComposable>
            ),
          },
        ],
      });
    }
  });

  return (
    <>
      <FilterToolbar<IPlan>
        filterCategories={filterCategories}
        filterValues={filterValues}
        setFilterValues={setFilterValues}
        endToolbarItems={
          <ToolbarItem>
            <CreatePlanButton variant="secondary" />
          </ToolbarItem>
        }
        pagination={
          <Pagination
            className={spacing.mtMd}
            {...paginationProps}
            widgetId="plans-table-pagination-top"
          />
        }
      />

      {filteredItems.length > 0 ? (
        <Table
          aria-label="Migration Plans table"
          className="plans-table"
          cells={columns}
          rows={rows}
          sortBy={sortBy}
          onSort={onSort}
          onCollapse={(_event, _rowKey, _isOpen, rowData) => {
            togglePlanExpanded(rowData.meta.plan);
          }}
        >
          <TableHeader />
          <TableBody />
        </Table>
      ) : (
        <TableEmptyState
          titleText="No migration plans found"
          bodyText="No results match your filter."
        />
      )}
      <Pagination {...paginationProps} widgetId="plans-table-pagination-bottom" variant="bottom" />
    </>
  );
};

export default PlansTable;
