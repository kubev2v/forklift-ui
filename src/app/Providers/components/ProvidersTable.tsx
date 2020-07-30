import * as React from 'react';
import { usePaginationState } from '@app/common/hooks';
import { Pagination } from '@patternfly/react-core';
import { ProviderType } from '@app/common/constants';

// TODO replace this with real data from e.g. redux
const providers = [];

interface IProvidersTableProps {
  activeProviderType: ProviderType;
}

const ProvidersTable: React.FunctionComponent<IProvidersTableProps> = ({ activeProviderType }) => {
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(providers, 10);
  return (
    <>
      <Pagination {...paginationProps} widgetId="providers-table-pagination-top" />
      TODO: table for {activeProviderType}
      <Pagination
        {...paginationProps}
        widgetId="providers-table-pagination-bottom"
        variant="bottom"
      />
    </>
  );
};

export default ProvidersTable;
