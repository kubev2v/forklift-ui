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
  TableVariant,
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

import { IVMStatus } from '@app/queries/types';
import { useSortState, usePaginationState } from '@app/common/hooks';
import PlanActionsDropdown from './PlanActionsDropdown';
import VMStatusTable from './VMStatusTable';
import { vmStatus1, vmStatus2 } from '@app/queries/mocks/plans.mock';
import PipelineSummary from '@app/common/components/PipelineSummary';

// TODO: Replace with final data definitions
interface ITempMockMigration {
  id: string;
  schedule: {
    begin: string;
    end: string;
  };
  status: IVMStatus;
  other: {
    copied: number;
    total: number;
    status: string;
  };
}

const mockMigration1: ITempMockMigration = {
  id: 'VM1',
  schedule: {
    begin: '09 Aug 2019, 08:19:11',
    end: '09 Aug 2019, 12:33:44',
  },
  status: vmStatus1,
  other: {
    copied: 93184,
    total: 125952,
    status: 'Ready',
  },
};

const mockMigration2: ITempMockMigration = {
  id: 'VM2',
  schedule: {
    begin: '09 Aug 2019, 08:19:11',
    end: '09 Aug 2019, 09:43:12',
  },
  status: vmStatus2,
  other: {
    copied: 87952,
    total: 87952,
    status: 'Running',
  },
};

const MOCK_TEMP_MIGRATIONS: ITempMockMigration[] = [mockMigration1, mockMigration2];

export interface IPlanMatchParams {
  url: string;
  planId: string;
}

const VMMigrationDetails: React.FunctionComponent = () => {
  // TODO: Remove test data
  const migrations = MOCK_TEMP_MIGRATIONS;

  const match = useRouteMatch<IPlanMatchParams>({
    path: '/plans/:planId',
    strict: true,
    sensitive: true,
  });

  const getSortValues = (migration: ITempMockMigration) => {
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

  const { selectedItems: expandedVMs, toggleItemSelected: toggleVMsExpanded } = useSelectionState<
    ITempMockMigration
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

  currentPageItems.forEach((migration: ITempMockMigration) => {
    const isExpanded = expandedVMs.includes(migration);

    let buttonText = '';
    if (migration.other.status !== 'Ready') {
      buttonText = 'Cancel';
    }

    rows.push({
      meta: { migration },
      isOpen: isExpanded,
      // isOpen: true,
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
    rows.push({
      parent: rows.length - 1,
      fullWidth: true,
      cells: [
        {
          title: <VMStatusTable vmstatus={migration.status} />,
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
              variant={TableVariant.compact}
              cells={columns}
              rows={rows}
              sortBy={sortBy}
              onSort={onSort}
              onCollapse={(event, rowKey, isOpen, rowData) => {
                toggleVMsExpanded(rowData.meta.migration);
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
