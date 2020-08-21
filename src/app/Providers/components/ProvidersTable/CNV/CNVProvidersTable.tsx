import * as React from 'react';
import { Pagination, List, ListItem } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  sortable,
  compoundExpand,
  classNames as classNamesTransform,
  ICell,
  IRow,
} from '@patternfly/react-table';
import { DatabaseIcon } from '@patternfly/react-icons';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';
import { useSortState, usePaginationState } from '@app/common/hooks';
import CNVProviderActionsDropdown from './CNVProviderActionsDropdown';
import { ICNVProvider } from '@app/Providers/types';
import ProviderStatus from '../ProviderStatus';

interface ICNVProvidersTableProps {
  providers: ICNVProvider[];
}

const CNVProvidersTable: React.FunctionComponent<ICNVProvidersTableProps> = ({
  providers,
}: ICNVProvidersTableProps) => {
  const columns: ICell[] = [
    { title: 'Name', transforms: [sortable] },
    { title: 'Endpoint', transforms: [sortable] },
    { title: 'Namespaces', transforms: [sortable] },
    { title: 'VMs', transforms: [sortable] },
    { title: 'Networks', transforms: [sortable] },
    { title: 'Storage classes', transforms: [sortable], cellTransforms: [compoundExpand] },
    { title: 'Status', transforms: [sortable] },
    { title: '', columnTransforms: [classNamesTransform(tableStyles.tableAction)] },
  ];

  const getSortValues = (provider: ICNVProvider) => {
    const { numNamespaces, numVMs, numNetworks } = provider.resourceCounts;
    return [
      provider.metadata.name,
      provider.spec.url,
      numNamespaces,
      numVMs,
      numNetworks,
      provider.metadata.storageClasses.length,
      provider.status.conditions[0].type, // TODO maybe surface the most serious status condition?,
      '',
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(providers, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const rows: IRow[] = currentPageItems.flatMap((provider: ICNVProvider) => {
    const { numNamespaces, numVMs, numNetworks } = provider.resourceCounts;
    return [
      {
        cells: [
          provider.metadata.name,
          provider.spec.url,
          numNamespaces,
          numVMs,
          numNetworks,
          {
            title: (
              <>
                <DatabaseIcon key="storage-classes-icon" />{' '}
                {provider.metadata.storageClasses.length}
              </>
            ),
            props: { isOpen: true, ariaControls: 'provider-0-storage-classes-expanded' }, // TODO ?
          },
          {
            title: <ProviderStatus provider={provider} />,
          },
          { title: <CNVProviderActionsDropdown /> },
        ],
      },
      {
        // TODO actually handle expand state, maybe don't render these rows at all when collapsed?
        parent: 0,
        compoundExpand: 5,
        cells: [
          {
            title: (
              <List>
                {provider.metadata.storageClasses.map((storageClass) => (
                  <ListItem key={storageClass}>{storageClass}</ListItem>
                ))}
              </List>
            ),
            props: { colSpan: columns.length, className: tableStyles.modifiers.noPadding },
          },
        ],
      },
    ];
  });

  return (
    <>
      <Pagination {...paginationProps} widgetId="providers-table-pagination-top" />
      <Table
        aria-label="OpenShift virtualization providers table"
        cells={columns}
        rows={rows}
        sortBy={sortBy}
        onSort={onSort}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <Pagination
        {...paginationProps}
        widgetId="providers-table-pagination-bottom"
        variant="bottom"
      />
    </>
  );
};

export default CNVProvidersTable;
