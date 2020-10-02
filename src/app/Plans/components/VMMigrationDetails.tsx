import * as React from 'react';
import { useRouteMatch } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  Pagination,
  PageSection,
  Title,
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
} from '@patternfly/react-table';
import { Link } from 'react-router-dom';
import { useSelectionState } from '@konveyor/lib-ui';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';

import { IMigration } from '@app/queries/types';
import { useSortState, usePaginationState } from '@app/common/hooks';
import VMStatusTable from './VMStatusTable';
import PipelineSummary from '@app/common/components/PipelineSummary';
import { PlanStatusType } from '@app/common/constants';

import { MOCK_MIGRATIONS } from '@app/queries/mocks/plans.mock';

export interface IPlanMatchParams {
  url: string;
  planId: string;
}

const VMMigrationDetails: React.FunctionComponent = () => {
  // TODO: Replace with useMockableQuery
  const migrations = MOCK_MIGRATIONS;

  const match = useRouteMatch<IPlanMatchParams>({
    path: '/plans/:planId',
    strict: true,
    sensitive: true,
  });

  const getSortValues = (migration: IMigration) => {
    return [
      migration.id,
      migration.schedule.begin,
      migration.schedule.end,
      migration.other.total,
      migration.other.status,
      '', // Action column
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(migrations, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const { toggleItemSelected: toggleVMExpanded, isItemSelected: isVMExpanded } = useSelectionState<
    IMigration
  >({
    items: sortedItems,
    isEqual: (a, b) => a.id === b.id,
  });

  const columns: ICell[] = [
    { title: 'Name', transforms: [sortable, wrappable], cellFormatters: [expandable] },
    { title: 'Start time', transforms: [sortable] },
    { title: 'End time', transforms: [sortable] },
    { title: 'Data copied', transforms: [sortable] },
    { title: 'Status', transforms: [sortable] },
    { title: '' },
  ];

  const rows: IRow[] = [];

  currentPageItems.forEach((migration: IMigration) => {
    const isExpanded = isVMExpanded(migration);

    let isButtonCancel = false;
    if (
      migration.other.status !== PlanStatusType.Ready &&
      migration.other.status !== PlanStatusType.Finished &&
      migration.other.status !== PlanStatusType.Error
    ) {
      isButtonCancel = true;
    }

    rows.push({
      meta: { migration },
      isOpen: isExpanded,
      cells: [
        migration.id,
        migration.schedule.begin,
        migration.schedule.end,
        `${Math.round(migration.other.copied / 1024)} / ${Math.round(
          migration.other.total / 1024
        )} GB`,
        {
          title: <PipelineSummary total={0} current={0} status={migration.other.status} />,
        },

        {
          title: isButtonCancel ? (
            <>
              <Button variant="secondary" onClick={() => alert('TODO')} isDisabled={false}>
                Cancel
              </Button>
            </>
          ) : null,
        },
      ],
    });
    rows.push({
      parent: rows.length - 1,
      fullWidth: true,
      cells: [
        {
          // TODO: status2 to be replaced once statuses consolidated
          title: <VMStatusTable vmstatus={migration.status2} />,
          columnTransforms: [classNamesTransform(alignment.textAlignRight)],
        },
      ],
    });
  });

  return (
    <>
      <PageSection variant="light">
        <Breadcrumb className={`${spacing.mbLg} ${spacing.prLg}`}>
          <BreadcrumbItem>
            <Link to={`/plans`}>Migration plans</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>{match?.params.planId}</BreadcrumbItem>
        </Breadcrumb>
        <Title headingLevel="h1">Migration Details by VM</Title>
      </PageSection>
      <PageSection>
        <Card>
          <CardBody>
            <Pagination {...paginationProps} widgetId="migration-vms-table-pagination-top" />
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
            <Pagination
              {...paginationProps}
              widgetId="migration-vms-table-pagination-bottom"
              variant="bottom"
            />
          </CardBody>
        </Card>
      </PageSection>
    </>
  );
};

export default VMMigrationDetails;
