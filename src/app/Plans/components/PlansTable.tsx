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
  Spinner,
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
  expandable,
  classNames,
  cellWidth,
  TableComposable,
  Tbody,
  Td,
  Th,
  Tr,
} from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';
import { Link } from 'react-router-dom';
import { useSelectionState } from '@konveyor/lib-ui';

import PlanActionsDropdown from './PlanActionsDropdown';
import { useSortState, usePaginationState } from '@app/common/hooks';
import { IPlan } from '@app/queries/types';
import { PlanStatusDisplayType, PlanStatusType } from '@app/common/constants';
import CreatePlanButton from './CreatePlanButton';
import { FilterToolbar, FilterType, FilterCategory } from '@app/common/components/FilterToolbar';
import { useFilterState } from '@app/common/hooks/useFilterState';
import { hasCondition } from '@app/common/helpers';
import TableEmptyState from '@app/common/components/TableEmptyState';
import {
  findLatestMigration,
  findProvidersByRefs,
  ISetCutoverArgs,
  useInventoryProvidersQuery,
  useMigrationsQuery,
} from '@app/queries';

import './PlansTable.css';
import { IKubeResponse, KubeClientError } from '@app/client/types';
import { IMigration } from '@app/queries/types/migrations.types';
import { MutateFunction, MutationResult } from 'react-query';
import { getPlanStatusTitle, getWarmPlanState } from './helpers';
import { isSameResource } from '@app/queries/helpers';
import StatusCondition from '@app/common/components/StatusCondition';

interface IPlansTableProps {
  plans: IPlan[];
  createMigration: MutateFunction<IKubeResponse<IMigration>, KubeClientError, IPlan>;
  createMigrationResult: MutationResult<IKubeResponse<IMigration>, KubeClientError>;
  setCutover: MutateFunction<IKubeResponse<IMigration>, KubeClientError, ISetCutoverArgs, unknown>;
  setCutoverResult: MutationResult<IKubeResponse<IMigration>, KubeClientError>;
}

const PlansTable: React.FunctionComponent<IPlansTableProps> = ({
  plans,
  createMigration,
  createMigrationResult,
  setCutover,
  setCutoverResult,
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
          if (hasCondition(item.status.conditions, PlanStatusType.Failed)) return 'Failed';
          if (hasCondition(item.status.conditions, PlanStatusType.Ready)) return 'Ready';
          if (hasCondition(item.status.conditions, PlanStatusType.Executing)) return 'Running';
          if (hasCondition(item.status.conditions, PlanStatusType.Succeeded)) return 'Succeeded';
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

  const {
    toggleItemSelected: togglePlanExpanded,
    isItemSelected: isPlanExpanded,
  } = useSelectionState<IPlan>({
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
    { title: 'Name', transforms: [sortable, wrappable], cellFormatters: [expandable] },
    { title: 'Type', transforms: [sortable] },
    { title: 'Plan status', transforms: [sortable, cellWidth(30)] },
    {
      title: '',
      transforms: [cellWidth(10)],
      columnTransforms: [classNames(alignment.textAlignRight)],
    },
  ];

  const rows: IRow[] = [];

  type ActionButtonType = 'Start' | 'Restart' | 'Cutover';

  currentPageItems.forEach((plan: IPlan) => {
    let buttonType: ActionButtonType | null = null;
    let title = '';
    let variant: ProgressVariant | undefined;

    const conditions = plan.status?.conditions || [];
    const latestMigration = findLatestMigration(plan, migrationsQuery.data?.items || null);
    const canBeStarted =
      hasCondition(conditions, PlanStatusType.Ready) &&
      !hasCondition(conditions, PlanStatusType.Executing) &&
      (!plan.status?.migration?.started ||
        plan.status?.migration?.vms?.some(
          (vm) => !hasCondition(vm.conditions || [], PlanStatusType.Succeeded)
        ));

    // TODO This whole if-else pile should instead be reduced to a union type like WarmPlanState but generalized.
    // TODO the PlanStatusType should be a union PlanConditionType and the PlanStatusDisplayType should perhaps not be a thing.
    if (hasCondition(conditions, PlanStatusType.Ready) && !plan.status?.migration?.started) {
      buttonType = 'Start';
    } else if (hasCondition(conditions, PlanStatusType.Executing)) {
      buttonType = null;
      title = PlanStatusDisplayType.Executing;
      if (plan.spec.warm) {
        title = 'Running cutover';
        if (!latestMigration?.spec.cutover) {
          buttonType = 'Cutover';
        }
      }
    } else if (hasCondition(conditions, PlanStatusType.Succeeded)) {
      title = PlanStatusDisplayType.Succeeded;
      variant = ProgressVariant.success;
    } else if (hasCondition(conditions, PlanStatusType.Canceled)) {
      title = PlanStatusDisplayType.Canceled;
    } else if (hasCondition(conditions, PlanStatusType.Failed)) {
      buttonType = 'Restart';
      title = PlanStatusDisplayType.Failed;
      variant = ProgressVariant.danger;
    } else if (plan.status?.migration?.started) {
      console.warn('Migration plan unexpected status:', plan);
    }

    if (buttonType !== 'Start' && canBeStarted) {
      buttonType = 'Restart';
    }

    const { statusValue = 0, statusMessage = '' } = ratioVMs(plan);

    const { sourceProvider, targetProvider } = findProvidersByRefs(
      plan.spec.provider,
      providersQuery
    );

    const isExpanded = isPlanExpanded(plan);

    const warmState = getWarmPlanState(plan, latestMigration);
    // TODO this is redundant with getWarmPlanState's 'Starting' case, maybe generalize that helper.
    const isBeingStarted =
      (!!latestMigration && !plan.status?.migration?.started) ||
      (plan.status?.migration?.started && (plan.status?.migration?.vms?.length || 0) === 0) ||
      warmState === 'Starting';

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
        plan.spec.warm ? 'Warm' : 'Cold',
        {
          title: isBeingStarted ? (
            'Running - preparing for migration'
          ) : warmState === 'Starting' ? (
            'Running - preparing for incremental data copies'
          ) : !plan.status?.migration?.started || warmState === 'NotStarted' ? (
            <StatusCondition status={plan.status} />
          ) : warmState === 'Copying' ? (
            'Running - performing incremental data copies'
          ) : warmState === 'StartingCutover' ? (
            'Running - preparing for cutover'
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
          title: buttonType ? (
            <>
              <Flex
                flex={{ default: 'flex_2' }}
                spaceItems={{ default: 'spaceItemsNone' }}
                alignItems={{ default: 'alignItemsCenter' }}
                flexWrap={{ default: 'nowrap' }}
              >
                <FlexItem align={{ default: 'alignRight' }}>
                  {isBeingStarted ? (
                    <Spinner size="md" className={spacing.mxLg} />
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (buttonType === 'Start' || buttonType === 'Restart') {
                          createMigration(plan);
                        } else if (buttonType === 'Cutover') {
                          setCutover({ plan, cutover: new Date().toISOString() });
                        }
                      }}
                      isDisabled={createMigrationResult.isLoading || setCutoverResult.isLoading}
                    >
                      {buttonType}
                    </Button>
                  )}
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
              <CreatePlanButton variant="secondary" />
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
