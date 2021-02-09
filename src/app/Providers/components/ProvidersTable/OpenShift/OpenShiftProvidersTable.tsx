import * as React from 'react';
import { Pagination, List, ListItem, Level, LevelItem, Button } from '@patternfly/react-core';
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
import { ICorrelatedProvider, IOpenShiftProvider } from '@app/queries/types/providers.types';
import ProviderActionsDropdown from '../ProviderActionsDropdown';
import StatusCondition from '@app/common/components/StatusCondition';
import { MappingType } from '@app/queries/types';
import { getMostSeriousCondition, numStr } from '@app/common/helpers';

import './OpenShiftProvidersTable.css';
import { ProviderType } from '@app/common/constants';
import { isSameResource } from '@app/queries/helpers';

interface IOpenShiftProvidersTableProps {
  providers: ICorrelatedProvider<IOpenShiftProvider>[];
}

const OpenShiftProvidersTable: React.FunctionComponent<IOpenShiftProvidersTableProps> = ({
  providers,
}: IOpenShiftProvidersTableProps) => {
  const storageClassesQuery = useStorageClassesQuery(
    providers.map((provider) => provider.inventory),
    MappingType.Storage
  );
  const getStorageClasses = (provider: ICorrelatedProvider<IOpenShiftProvider>) =>
    (storageClassesQuery.data && storageClassesQuery.data[provider.metadata.name]) || [];

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

  const getSortValues = (provider: ICorrelatedProvider<IOpenShiftProvider>) => {
    const { namespaceCount, vmCount, networkCount } = provider.inventory || {};
    const storageClasses = getStorageClasses(provider);
    return [
      '', // Radio button column
      provider.metadata.name,
      provider.spec.url || '',
      numStr(namespaceCount),
      numStr(vmCount),
      numStr(networkCount),
      numStr(storageClasses.length),
      provider.status ? getMostSeriousCondition(provider.status?.conditions) : '',
      '',
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(providers, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const {
    toggleItemSelected: toggleProviderExpanded,
    isItemSelected: isProviderExpanded,
  } = useSelectionState<ICorrelatedProvider<IOpenShiftProvider>>({
    items: sortedItems,
    isEqual: (a, b) => isSameResource(a.metadata, b.metadata),
  });

  const [
    selectedProvider,
    setSelectedProvider,
  ] = React.useState<ICorrelatedProvider<IOpenShiftProvider> | null>(null);

  const rows: IRow[] = [];
  currentPageItems.forEach((provider: ICorrelatedProvider<IOpenShiftProvider>) => {
    const { namespaceCount, vmCount, networkCount } = provider.inventory || {};
    const isExpanded = isProviderExpanded(provider);
    const storageClasses = getStorageClasses(provider);
    rows.push({
      meta: { provider },
      isOpen: isExpanded,
      selected: isSameResource(selectedProvider?.metadata, provider.metadata),
      cells: [
        provider.metadata.name,
        provider.spec.url,
        numStr(namespaceCount),
        numStr(vmCount),
        numStr(networkCount),
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
          title: <StatusCondition status={provider.status} />,
        },
        {
          title: (
            <ProviderActionsDropdown provider={provider} providerType={ProviderType.openshift} />
          ),
        },
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
      <Level>
        <LevelItem>
          <Button variant="secondary" onClick={() => alert('TODO')} isDisabled={!selectedProvider}>
            Select migration network
          </Button>
        </LevelItem>
        <LevelItem>
          <Pagination {...paginationProps} widgetId="providers-table-pagination-top" />
        </LevelItem>
      </Level>
      <Table
        aria-label="OpenShift Virtualization providers table"
        cells={columns}
        rows={rows}
        sortBy={sortBy}
        onSort={onSort}
        onExpand={(_event, _rowIndex, _colIndex, _isOpen, rowData) => {
          toggleProviderExpanded(rowData.meta.provider);
        }}
        onSelect={(_event, _isSelected, _rowIndex, rowData) => {
          setSelectedProvider(rowData.meta.provider);
        }}
        selectVariant="radio"
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
