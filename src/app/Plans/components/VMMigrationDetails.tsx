import * as React from 'react';
import { useRouteMatch } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardBody,
  Pagination,
  PageSection,
  Title,
  Level,
  LevelItem,
  Button,
  Flex,
} from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  sortable,
  classNames as classNamesTransform,
  ICell,
  IRow,
  wrappable,
  expandable,
  cellWidth,
  truncate,
  nowrap,
} from '@patternfly/react-table';
import { Link } from 'react-router-dom';
import { useSelectionState } from '@konveyor/lib-ui';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';

import { useSortState, usePaginationState, useFilterState } from '@app/common/hooks';
import VMStatusTable from './VMStatusTable';
import PipelineSummary, { getPipelineSummaryTitle } from '@app/common/components/PipelineSummary';

import { FilterCategory, FilterToolbar, FilterType } from '@app/common/components/FilterToolbar';
import TableEmptyState from '@app/common/components/TableEmptyState';
import { IVMStatus } from '@app/queries/types';
import { useCancelVMsMutation, usePlansQuery } from '@app/queries';
import { formatTimestamp, hasCondition } from '@app/common/helpers';
import {
  useInventoryProvidersQuery,
  findProvidersByRefs,
  useVMwareVMsQuery,
  findVMById,
} from '@app/queries';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { PlanStatusType } from '@app/common/constants';
import ConfirmModal from '@app/common/components/ConfirmModal';

export interface IPlanMatchParams {
  url: string;
  planName: string;
}

const getTotalCopiedRatio = (vmStatus: IVMStatus) => {
  const diskTransferSteps = vmStatus.pipeline.filter((step) => step.name === 'DiskTransfer');
  let completed = 0;
  let total = 0;
  diskTransferSteps.forEach((step) => {
    completed += step.progress.completed;
    total += step.progress.total;
  });
  return { completed, total };
};

const VMMigrationDetails: React.FunctionComponent = () => {
  const match = useRouteMatch<IPlanMatchParams>({
    path: '/plans/:planName',
    strict: true,
    sensitive: true,
  });

  const plansQuery = usePlansQuery();
  const [cancelVMs, cancelVMsResult] = useCancelVMsMutation();
  const [isCancelModalOpen, toggleCancelModal] = React.useReducer((isOpen) => !isOpen, false);

  const plan = plansQuery.data?.items.find((item) => item.metadata.name === match?.params.planName);
  const planStarted = !!plan?.status?.migration?.started;
  const vmStatuses = planStarted
    ? plan?.status?.migration?.vms || []
    : plan?.spec.vms.map(({ id }) => ({
        id,
        pipeline: [],
        phase: '',
      })) || [];

  const providersQuery = useInventoryProvidersQuery();
  const { sourceProvider } = findProvidersByRefs(plan?.spec.provider || null, providersQuery);

  const vmsQuery = useVMwareVMsQuery(sourceProvider);

  const getSortValues = (vmStatus: IVMStatus) => {
    return [
      '', // Expand/collapse control column
      findVMById(vmStatus.id, vmsQuery)?.name || '',
      vmStatus.started || '',
      vmStatus.completed || '',
      getTotalCopiedRatio(vmStatus).completed,
      getPipelineSummaryTitle(vmStatus),
    ];
  };

  const filterCategories: FilterCategory<IVMStatus>[] = [
    {
      key: 'id',
      title: 'Name',
      type: FilterType.search,
      placeholderText: 'Filter by name ...',
      getItemValue: (item) => {
        return findVMById(item.id, vmsQuery)?.name || '';
      },
    },
    {
      key: 'begin',
      title: 'Start time',
      type: FilterType.search,
      placeholderText: 'Filter by start time ...',
      getItemValue: (item) => {
        return item.started || '';
      },
    },
    {
      key: 'end',
      title: 'End time',
      type: FilterType.search,
      placeholderText: 'Filter by end time ...',
      getItemValue: (item) => {
        return item.completed || '';
      },
    },
    {
      key: 'status',
      title: 'Status',
      type: FilterType.select,
      selectOptions: [
        { key: 'Completed', value: 'Completed' },
        { key: 'Not Started', value: 'Not Started' },
        { key: 'On Error', value: 'On Error' },
        { key: 'In Progress', value: 'In Progress' },
      ],
      getItemValue: (item) => {
        if (!item.started) return 'Not Started';
        if (item.completed) return 'Completed';
        if (item.pipeline.find((step) => step.error)) return 'On Error';
        return 'In Progress';
      },
    },
  ];

  const { filterValues, setFilterValues, filteredItems } = useFilterState(
    vmStatuses,
    filterCategories
  );

  const { sortBy, onSort, sortedItems } = useSortState(filteredItems, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const {
    selectedItems,
    isItemSelected,
    toggleItemSelected,
    setSelectedItems,
  } = useSelectionState<IVMStatus>({
    items: sortedItems,
    isEqual: (a, b) => a.id === b.id,
  });
  const cancelableVms = !hasCondition(plan?.status?.conditions || [], PlanStatusType.Executing)
    ? []
    : (vmStatuses as IVMStatus[]).filter((vm) => !!vm.started && !vm.completed);
  const selectAllCancelable = (isSelected: boolean) =>
    isSelected ? setSelectedItems(cancelableVms) : setSelectedItems([]);

  const {
    toggleItemSelected: toggleVMExpanded,
    isItemSelected: isVMExpanded,
  } = useSelectionState<IVMStatus>({
    items: sortedItems,
    isEqual: (a, b) => a.id === b.id,
  });

  const columns: ICell[] = [
    {
      title: 'Name',
      transforms: [sortable, wrappable],
      cellFormatters: planStarted ? [expandable] : [],
    },
    { title: 'Start time', transforms: [sortable], cellTransforms: [truncate] },
    { title: 'End time', transforms: [sortable], cellTransforms: [truncate] },
    { title: 'Data copied', transforms: [sortable] },
    {
      title: 'Status',
      transforms: [sortable, cellWidth(20), nowrap],
    },
    { title: '', columnTransforms: [classNamesTransform(alignment.textAlignRight)] },
  ];

  const rows: IRow[] = [];

  currentPageItems.forEach((vmStatus: IVMStatus) => {
    const isExpanded = isVMExpanded(vmStatus);
    const ratio = getTotalCopiedRatio(vmStatus);

    rows.push({
      meta: { vmStatus },
      selected: isItemSelected(vmStatus),
      disableSelection: !cancelableVms.find((vm) => vm === vmStatus),
      isOpen: planStarted ? isExpanded : undefined,
      cells: [
        findVMById(vmStatus.id, vmsQuery)?.name || '',
        formatTimestamp(vmStatus.started),
        formatTimestamp(vmStatus.completed),
        `${Math.round(ratio.completed / 1024)} / ${Math.round(ratio.total / 1024)} GB`,
        {
          title: <PipelineSummary status={vmStatus} />,
        },
      ],
    });
    if (isExpanded) {
      rows.push({
        parent: rows.length - 1,
        fullWidth: true,
        cells: [
          {
            title: <VMStatusTable status={vmStatus} />,
            columnTransforms: [classNamesTransform(alignment.textAlignRight)],
          },
        ],
      });
    }
  });

  return (
    <>
      <PageSection variant="light">
        <Breadcrumb className={`${spacing.mbLg} ${spacing.prLg}`}>
          <BreadcrumbItem>
            <Link to={`/plans`}>Migration plans</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>{match?.params.planName}</BreadcrumbItem>
        </Breadcrumb>
        <Title headingLevel="h1">Migration details by VM</Title>
      </PageSection>
      <PageSection>
        <ResolvedQueries
          results={[plansQuery, providersQuery, vmsQuery]}
          errorTitles={[
            'Error loading plan details',
            'Error loading providers',
            'Error loading VMs',
          ]}
          errorsInline={false}
        >
          <Card>
            <CardBody>
              <Level>
                <LevelItem>
                  <Flex>
                    <FilterToolbar<IVMStatus>
                      filterCategories={filterCategories}
                      filterValues={filterValues}
                      setFilterValues={setFilterValues}
                    />
                    <Button
                      variant="secondary"
                      isDisabled={selectedItems.length === 0 || cancelVMsResult.isLoading}
                      onClick={toggleCancelModal}
                    >
                      Cancel selected
                    </Button>
                  </Flex>
                </LevelItem>
                <LevelItem>
                  <Pagination {...paginationProps} widgetId="migration-vms-table-pagination-top" />
                </LevelItem>
              </Level>
              {filteredItems.length > 0 ? (
                <Table
                  aria-label="Migration VMs table"
                  cells={columns}
                  rows={rows}
                  sortBy={sortBy}
                  onSort={onSort}
                  onCollapse={(event, rowKey, isOpen, rowData) => {
                    toggleVMExpanded(rowData.meta.vmStatus);
                  }}
                  onSelect={(_event, isSelected, rowIndex, rowData) => {
                    if (rowIndex === -1) {
                      selectAllCancelable(isSelected);
                    } else {
                      toggleItemSelected(rowData.meta.vmStatus, isSelected);
                    }
                  }}
                  canSelectAll={cancelableVms.length > 0}
                >
                  <TableHeader />
                  <TableBody />
                </Table>
              ) : (
                <TableEmptyState
                  titleText="No migration details found"
                  bodyText="No results match your filter."
                />
              )}
              <Pagination
                {...paginationProps}
                widgetId="migration-vms-table-pagination-bottom"
                variant="bottom"
              />
            </CardBody>
          </Card>
        </ResolvedQueries>
      </PageSection>
      <ConfirmModal
        isOpen={isCancelModalOpen}
        toggleOpen={toggleCancelModal}
        mutateFn={() => cancelVMs(selectedItems)}
        mutateResult={cancelVMsResult}
        title="Cancel VM migrations"
        confirmButtonText="Cancel migrations"
        cancelButtonText="Don't cancel migrations" // TODO need to revisit this phrasing
        body={
          <>
            Are you sure you want to cancel migration of the following VMs?
            <br />
            <br />
            <ul>
              {selectedItems.map((vm) => (
                <li key={vm.id}>
                  <strong>{findVMById(vm.id, vmsQuery)?.name || ''}</strong>
                </li>
              ))}
            </ul>
          </>
        }
        errorText="Error canceling migrations"
      />
    </>
  );
};

export default VMMigrationDetails;
