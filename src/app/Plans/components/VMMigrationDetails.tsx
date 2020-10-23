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
  Alert,
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
import { usePlansQuery } from '@app/queries/plans';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import { formatTimestamp } from '@app/common/helpers';
import {
  useProvidersQuery,
  findProvidersByRefs,
  useVMwareVMsQuery,
  findVMById,
} from '@app/queries';

export interface IPlanMatchParams {
  url: string;
  planName: string;
}

const getTotalCopiedRatio = (vmStatus: IVMStatus) => {
  const diskTransferTasks = vmStatus.pipeline.tasks.filter((task) => task.name === 'DiskTransfer');
  let completed = 0;
  let total = 0;
  diskTransferTasks.forEach((task) => {
    completed += task.progress.completed;
    total += task.progress.total;
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
  const plan = plansQuery.data?.items.find((item) => item.metadata.name === match?.params.planName);
  const planStarted = !!plan?.status?.migration?.started;
  const vmStatuses = planStarted
    ? plan?.status?.migration?.vms || []
    : plan?.spec.vms.map(({ id }) => ({
        id,
        pipeline: { tasks: [] },
        phase: '',
      })) || [];

  const providersQuery = useProvidersQuery();
  const { sourceProvider } = findProvidersByRefs(plan?.spec.provider || null, providersQuery);

  const vmsQuery = useVMwareVMsQuery(sourceProvider);

  const getSortValues = (vmStatus: IVMStatus) => {
    return [
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
  ];

  const { filterValues, setFilterValues, filteredItems } = useFilterState(
    vmStatuses,
    filterCategories
  );

  const { sortBy, onSort, sortedItems } = useSortState(filteredItems, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const { toggleItemSelected: toggleVMExpanded, isItemSelected: isVMExpanded } = useSelectionState<
    IVMStatus
  >({
    items: sortedItems,
    isEqual: (a, b) => a.id === b.id,
  });

  const columns: ICell[] = [
    {
      title: 'Name',
      transforms: [sortable, wrappable],
      cellFormatters: planStarted ? [expandable] : [],
    },
    { title: 'Start time', transforms: [sortable] },
    { title: 'End time', transforms: [sortable] },
    { title: 'Data copied', transforms: [sortable] },
    {
      title: 'Status',
      transforms: [sortable, cellWidth(10)],
    },
    { title: '', columnTransforms: [classNamesTransform(alignment.textAlignRight)] },
  ];

  const rows: IRow[] = [];

  currentPageItems.forEach((vmStatus: IVMStatus) => {
    const isExpanded = isVMExpanded(vmStatus);

    const ratio = getTotalCopiedRatio(vmStatus);

    rows.push({
      meta: { vmStatus },
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
        <Title headingLevel="h1">Migration Details by VM</Title>
      </PageSection>
      <PageSection>
        {plansQuery.isLoading || providersQuery.isLoading || vmsQuery.isLoading ? (
          <LoadingEmptyState />
        ) : plansQuery.isError ? (
          <Alert variant="danger" isInline title="Error loading plan details" />
        ) : providersQuery.isError ? (
          <Alert variant="danger" isInline title="Error loading providers" />
        ) : vmsQuery.isError ? (
          <Alert variant="danger" isInline title="Error loading VMs" />
        ) : (
          <Card>
            <CardBody>
              <Level>
                <LevelItem>
                  <FilterToolbar<IVMStatus>
                    filterCategories={filterCategories}
                    filterValues={filterValues}
                    setFilterValues={setFilterValues}
                  />
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
                    toggleVMExpanded(rowData.meta.migration);
                  }}
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
        )}
      </PageSection>
    </>
  );
};

export default VMMigrationDetails;
