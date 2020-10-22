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
import { useStorageClassesQuery } from '@app/queries';
import { IOpenShiftProvider } from '@app/queries/types/providers.types';
import OpenShiftProviderActionsDropdown from './OpenShiftProviderActionsDropdown';
import ProviderStatus from '../ProviderStatus';
import { MappingType } from '@app/queries/types';
import { mostSeriousCondition } from '@app/common/helpers';

import './OpenShiftProvidersTable.css';

interface IOpenShiftProvidersTableProps {
  providers: IOpenShiftProvider[];
}

const OpenShiftProvidersTable: React.FunctionComponent<IOpenShiftProvidersTableProps> = ({
  providers,
}: IOpenShiftProvidersTableProps) => {
  const storageClassesQuery = useStorageClassesQuery(providers, MappingType.Storage);

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

  const getSortValues = (provider: IOpenShiftProvider) => {
    const { name, namespaceCount, vmCount, networkCount } = provider;
    const storageClasses = storageClassesQuery.data ? storageClassesQuery.data[name] : [];
    return [
      name,
      provider.object.spec.url,
      namespaceCount,
      vmCount,
      networkCount,
      storageClasses.length,
      provider.object.status ? mostSeriousCondition(provider.object.status?.conditions) : '',
      '',
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(providers, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const {
    toggleItemSelected: toggleProviderExpanded,
    isItemSelected: isProviderExpanded,
  } = useSelectionState<IOpenShiftProvider>({
    items: sortedItems,
    isEqual: (a, b) => a.name === b.name,
  });

  const rows: IRow[] = [];
  currentPageItems.forEach((provider: IOpenShiftProvider) => {
    const { name, namespaceCount, vmCount, networkCount } = provider;
    const isExpanded = isProviderExpanded(provider);
    const storageClasses = storageClassesQuery.data ? storageClassesQuery.data[name] : [];
    rows.push({
      meta: { provider },
      isOpen: isExpanded,
      cells: [
        name,
        provider.object.spec.url,
        namespaceCount,
        vmCount,
        networkCount,
        {
          title: (
            <>
              <DatabaseIcon key="storage-classes-icon" /> {storageClasses.length}
            </>
          ),
          props: {
            isOpen: isExpanded,
          },
        },
        {
          title: <ProviderStatus provider={provider} />,
        },
        { title: <OpenShiftProviderActionsDropdown /> },
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
                {storageClasses.map((storageClass) => (
                  <ListItem key={storageClass.name}>{storageClass.name}</ListItem>
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

export default OpenShiftProvidersTable;
