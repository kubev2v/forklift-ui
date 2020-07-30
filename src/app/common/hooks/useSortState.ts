import * as React from 'react';
import { ISortBy, SortByDirection } from '@patternfly/react-table';

// TODO these could be given generic types to avoid using `any` (https://www.typescriptlang.org/docs/handbook/generics.html)

interface SortStateHook {
  sortBy: ISortBy;
  onSort: (event: React.SyntheticEvent, index: number, direction: SortByDirection) => void;
  sortedItems: any[];
}

export const useSortState = (
  items: any[],
  getSortValues: (item: any) => (string | number | boolean)[]
): SortStateHook => {
  const [sortBy, setSortBy] = React.useState<ISortBy>({});
  const onSort = (event: React.SyntheticEvent, index: number, direction: SortByDirection) => {
    setSortBy({ index, direction });
  };

  const sortedItems = [...items].sort((a: any, b: any) => {
    const { index, direction } = sortBy;
    const aValue = getSortValues(a)[index || 0];
    const bValue = getSortValues(b)[index || 0];
    if (aValue < bValue) return direction === SortByDirection.asc ? -1 : 1;
    if (aValue > bValue) return direction === SortByDirection.asc ? 1 : -1;
    return 0;
  });

  return { sortBy, onSort, sortedItems };
};
