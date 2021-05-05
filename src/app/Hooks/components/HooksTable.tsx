import * as React from 'react';
import { Button, Flex, FlexItem, Level, LevelItem, Pagination } from '@patternfly/react-core';
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
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { useSortState, usePaginationState } from '@app/common/hooks';
import { IHook } from '@app/queries/types';
import { FilterToolbar, FilterType, FilterCategory } from '@app/common/components/FilterToolbar';
import { useFilterState } from '@app/common/hooks/useFilterState';
import TableEmptyState from '@app/common/components/TableEmptyState';
import HookActionsDropdown from './HookActionsDropdown';

interface IHooksTableProps {
  hooks: IHook[];
  openCreateHookModal: () => void;
  openEditHookModal: (hook: IHook) => void;
}

const HooksTable: React.FunctionComponent<IHooksTableProps> = ({
  hooks,
  openCreateHookModal,
  openEditHookModal,
}: IHooksTableProps) => {
  const filterCategories: FilterCategory<IHook>[] = [
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
      key: 'url',
      title: 'URL',
      type: FilterType.search,
      placeholderText: 'Filter by URL...',
      getItemValue: (item) => {
        return item.spec.url;
      },
    },
    {
      key: 'branch',
      title: 'Branch',
      type: FilterType.search,
      placeholderText: 'Filter by branch...',
      getItemValue: (item) => {
        return item.spec.branch;
      },
    },
  ];

  const { filterValues, setFilterValues, filteredItems } = useFilterState(hooks, filterCategories);
  const getSortValues = (hook: IHook) => [
    hook.metadata.name,
    hook.spec.url,
    hook.spec.branch,
    // TODO: Depending on approach of using pass-by-reference behavior or not, remember to add sort (or not)
    '', // plans column,
    '', // Action column
  ];

  const { sortBy, onSort, sortedItems } = useSortState(filteredItems, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const columns: ICell[] = [
    { title: 'Name', transforms: [sortable, wrappable] },
    { title: 'Git repository URL', transforms: [sortable, wrappable] },
    { title: 'Branch', transforms: [sortable] },
    { title: 'Plans', transforms: [cellWidth(20)] },
    {
      title: '',
      transforms: [cellWidth(10)],
      columnTransforms: [classNames(alignment.textAlignRight)],
    },
  ];

  const rows: IRow[] = currentPageItems.map((hook: IHook) => {
    return {
      meta: { hook },
      cells: [
        hook.metadata.name,
        hook.spec.url,
        hook.spec.branch,
        // TODO: This add plans
        0,
        {
          title: (
            <HookActionsDropdown hook={hook} openEditHookModal={() => openEditHookModal(hook)} />
          ),
        },
      ],
    };
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
              <FilterToolbar<IHook>
                filterCategories={filterCategories}
                filterValues={filterValues}
                setFilterValues={setFilterValues}
              />
            </FlexItem>
            <FlexItem>
              <div>
                <Button
                  className={spacing.mtMd}
                  variant="secondary"
                  onClick={() => openCreateHookModal()}
                >
                  Create hook
                </Button>
              </div>
            </FlexItem>
          </Flex>
        </LevelItem>
        <LevelItem>
          <Pagination {...paginationProps} widgetId="hooks-table-pagination-top" />
        </LevelItem>
      </Level>
      {filteredItems.length > 0 ? (
        <Table
          aria-label="Hooks table"
          className="hooks-table"
          cells={columns}
          rows={rows}
          sortBy={sortBy}
          onSort={onSort}
        >
          <TableHeader />
          <TableBody />
        </Table>
      ) : (
        <TableEmptyState titleText="No hooks found" bodyText="No results match your filter." />
      )}
      <Pagination {...paginationProps} widgetId="hooks-table-pagination-bottom" variant="bottom" />
    </>
  );
};

export default HooksTable;
