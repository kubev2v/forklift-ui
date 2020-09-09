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
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useSelectionState } from '@konveyor/lib-ui';
import { useSortState, usePaginationState } from '@app/common/hooks';
import CNVProviderActionsDropdown from './CNVProviderActionsDropdown';
import { ICNVProvider } from '@app/Providers/types';
import ProviderStatus from '../ProviderStatus';
import './CNVProvidersTable.css';

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

  const {
    selectedItems: expandedProviders,
    toggleItemSelected: toggleProviderExpanded,
    isItemSelected,
  } = useSelectionState<ICNVProvider>({
    items: sortedItems,
    isEqual: (a, b) => a.metadata.name === b.metadata.name,
  });

  const rows: IRow[] = [];
  currentPageItems.forEach((provider: ICNVProvider) => {
    const { numNamespaces, numVMs, numNetworks } = provider.resourceCounts;
    const isExpanded = isItemSelected(provider);
    rows.push({
      meta: { provider },
      isOpen: isExpanded,
      cells: [
        provider.metadata.name,
        provider.spec.url,
        numNamespaces,
        numVMs,
        numNetworks,
        {
          title: (
            <>
              <DatabaseIcon key="storage-classes-icon" /> {provider.metadata.storageClasses.length}
            </>
          ),
          props: {
            isOpen: isExpanded,
          },
        },
        {
          title: <ProviderStatus provider={provider} />,
        },
        { title: <CNVProviderActionsDropdown /> },
      ],
    });
    if (isExpanded) {
      rows.push({
        parent: rows.length - 1,
        compoundExpand: 5,
        cells: [
          {
            title: (
              <List className={`provider-storage-classes-list ${spacing.mMd}`}>
                {provider.metadata.storageClasses.map((storageClass) => (
                  <ListItem key={storageClass}>{storageClass}</ListItem>
                ))}
              </List>
            ),
            props: { colSpan: columns.length, className: tableStyles.modifiers.noPadding },
          },
        ],
      });
    }
  });

  return (
    <>
      <Pagination {...paginationProps} widgetId="providers-table-pagination-top" />
      <Table
        aria-label="OpenShift Virtualization providers table"
        cells={columns}
        rows={rows}
        sortBy={sortBy}
        onSort={onSort}
        onExpand={(_event, _rowIndex, _colIndex, _isOpen, rowData) => {
          toggleProviderExpanded(rowData.meta.provider);
        }}
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
