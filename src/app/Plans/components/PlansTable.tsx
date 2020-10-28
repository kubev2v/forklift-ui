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
  classNames,
  cellWidth,
} from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';
import { Link } from 'react-router-dom';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';

import PlanActionsDropdown from './PlanActionsDropdown';
import { useSortState, usePaginationState } from '@app/common/hooks';
import { IPlan } from '@app/queries/types';
import { PlanStatusDisplayType, PlanStatusAPIType } from '@app/common/constants';
import CreatePlanButton from './CreatePlanButton';
import { FilterToolbar, FilterType, FilterCategory } from '@app/common/components/FilterToolbar';
import { useFilterState } from '@app/common/hooks/useFilterState';
import { hasCondition } from '@app/common/helpers';
import TableEmptyState from '@app/common/components/TableEmptyState';
import { findProvidersByRefs, useProvidersQuery } from '@app/queries';

import './PlansTable.css';
import { KubeClientError } from '@app/client/types';
import { IMigration } from '@app/queries/types/migrations.types';
import { MutationResult } from 'react-query';
import { getPlanStatusTitle } from './helpers';
import { isSameResource } from '@app/queries/helpers';

interface IPlansTableProps {
  plans: IPlan[];
  createMigration: (plan: IPlan) => Promise<IMigration | undefined>;
  createMigrationResult: MutationResult<IMigration, KubeClientError>;
  planBeingStarted: IPlan | null;
}

const PlansTable: React.FunctionComponent<IPlansTableProps> = ({
  plans,
  createMigration,
  createMigrationResult,
  planBeingStarted,
}: IPlansTableProps) => {
  const providersQuery = useProvidersQuery();
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
      type: FilterType.search,
      placeholderText: 'Filter state...',
      getItemValue: getPlanStatusTitle,
    },
  ];

  const { filterValues, setFilterValues, filteredItems } = useFilterState(plans, filterCategories);
  const getSortValues = (plan: IPlan) => {
    const { sourceProvider, targetProvider } = findProvidersByRefs(
      plan.spec.provider,
      providersQuery
    );
    return [
      plan.metadata.name,
      sourceProvider?.name || '',
      targetProvider?.name || '',
      plan.spec.vms.length,
      getPlanStatusTitle(plan),
      '', // Action column
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(filteredItems, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const ratioVMs = (plan: IPlan) => {
    const totalVMs = plan.spec.vms.length;
    const numVMsDone = plan.status?.migration?.vms?.filter((vm) => !!vm.completed).length || 0;
    const statusValue = totalVMs > 0 ? (numVMsDone * 100) / totalVMs : 0;
    const statusMessage = `${numVMsDone} of ${totalVMs} VMs migrated`;

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

  enum ActionButtonType {
    Start = 'Start',
    Cancel = 'Cancel',
  }

  currentPageItems.forEach((plan: IPlan) => {
    let buttonType: ActionButtonType | null = null;
    let isInitializing = false;
    let isStatusReady = false;
    let title = '';
    let variant: ProgressVariant | undefined;

    const conditions = plan.status?.conditions || [];

    if (hasCondition(conditions, PlanStatusAPIType.Ready) && !plan.status?.migration?.started) {
      buttonType = ActionButtonType.Start;
      isStatusReady = true;
    } else if (hasCondition(conditions, PlanStatusAPIType.Succeeded)) {
      title = PlanStatusDisplayType.Succeeded;
      variant = ProgressVariant.success;
    } else if (hasCondition(conditions, PlanStatusAPIType.Failed)) {
      title = PlanStatusDisplayType.Failed;
      variant = ProgressVariant.danger;
    } else if (hasCondition(conditions, PlanStatusAPIType.Executing)) {
      buttonType = ActionButtonType.Cancel;
      title = PlanStatusDisplayType.Executing;
    } else {
      isInitializing = true;
    }

    const { statusValue = 0, statusMessage = '' } = ratioVMs(plan);

    const { sourceProvider, targetProvider } = findProvidersByRefs(
      plan.spec.provider,
      providersQuery
    );

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
        sourceProvider?.name || '',
        targetProvider?.name || '',
        plan.spec.vms.length,
        {
          title: isInitializing ? (
            <Spinner size="md" />
          ) : isStatusReady ? (
            <StatusIcon status={StatusType.Ok} label={PlanStatusDisplayType.Ready} />
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
          // TODO: Cancellation is disabled until we have API support.
          //   When it is ready, this condition should just be `title: buttonType ? (`
          title:
            buttonType && buttonType === ActionButtonType.Start ? (
              <>
                <Flex
                  flex={{ default: 'flex_2' }}
                  spaceItems={{ default: 'spaceItemsNone' }}
                  alignItems={{ default: 'alignItemsCenter' }}
                  flexWrap={{ default: 'nowrap' }}
                >
                  <FlexItem align={{ default: 'alignRight' }}>
                    {isSameResource(planBeingStarted?.metadata, plan.metadata) ? (
                      <Spinner size="md" className={spacing.mxLg} />
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          if (buttonType === ActionButtonType.Start) {
                            createMigration(plan);
                          }
                          if (buttonType === ActionButtonType.Cancel) {
                            alert('TODO');
                          }
                        }}
                        isDisabled={
                          buttonType === ActionButtonType.Start && createMigrationResult.isLoading
                        }
                      >
                        {buttonType}
                      </Button>
                    )}
                  </FlexItem>
                  <FlexItem>
                    <PlanActionsDropdown conditions={conditions} />
                  </FlexItem>
                </Flex>
              </>
            ) : (
              <PlanActionsDropdown conditions={conditions} />
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
          bodyText="No results match your filter."
        />
      )}
      <Pagination {...paginationProps} widgetId="plans-table-pagination-bottom" variant="bottom" />
    </>
  );
};

export default PlansTable;
