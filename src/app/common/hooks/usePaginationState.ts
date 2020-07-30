import * as React from 'react';
import { PaginationProps } from '@patternfly/react-core';

// TODO these could be given generic types to avoid using `any` (https://www.typescriptlang.org/docs/handbook/generics.html)

interface PaginationStateHook {
  currentPageItems: any[];
  setPageNumber: (pageNumber: number) => void;
  paginationProps: PaginationProps;
}

export const usePaginationState = (
  items: any[],
  initialItemsPerPage: number
): PaginationStateHook => {
  const [pageNumber, setPageNumber] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(initialItemsPerPage);

  const pageStartIndex = (pageNumber - 1) * itemsPerPage;
  const currentPageItems = items.slice(pageStartIndex, pageStartIndex + itemsPerPage);

  const paginationProps: PaginationProps = {
    itemCount: items.length,
    perPage: itemsPerPage,
    page: pageNumber,
    onSetPage: (event, pageNumber) => setPageNumber(pageNumber),
    onPerPageSelect: (event, perPage) => setItemsPerPage(perPage),
  };

  return { currentPageItems, setPageNumber, paginationProps };
};
