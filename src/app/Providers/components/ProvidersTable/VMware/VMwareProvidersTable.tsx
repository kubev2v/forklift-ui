import * as React from 'react';
import { Pagination, Button, Level, LevelItem } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  sortable,
  classNames as classNamesTransform,
  ICell,
  IRow,
} from '@patternfly/react-table';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';
import { useSelectionState } from '@konveyor/lib-ui';

import { useSortState, usePaginationState } from '@app/common/hooks';
import { IVMwareProvider } from '@app/queries/types';
import ProviderActionsDropdown from '../ProviderActionsDropdown';
import ProviderStatus from '../ProviderStatus';
import { mostSeriousCondition } from '@app/common/helpers';

import './VMwareProvidersTable.css';
import { ProviderType } from '@app/common/constants';

import DownloadButton from '../DownloadButton';

interface IVMwareProvidersTableProps {
  providers: IVMwareProvider[];
}

const VMwareProvidersTable: React.FunctionComponent<IVMwareProvidersTableProps> = ({
  providers,
}: IVMwareProvidersTableProps) => {
  const getSortValues = (provider: IVMwareProvider) => {
    const { clusterCount, hostCount, vmCount, networkCount, datastoreCount } = provider;
    return [
      '',
      provider.name,
      provider.object.spec.url,
      clusterCount,
      hostCount,
      vmCount,
      networkCount,
      datastoreCount,
      provider.object.status ? mostSeriousCondition(provider.object.status?.conditions) : '',
      '',
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(providers, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const {
    selectedItems,
    toggleItemSelected,
    areAllSelected,
    selectAll,
    isItemSelected,
  } = useSelectionState<IVMwareProvider>({ items: sortedItems });
  const {
    toggleItemSelected: toggleProviderExpanded,
    isItemSelected: isItemExpanded,
  } = useSelectionState<IVMwareProvider>({
    items: sortedItems,
    isEqual: (a, b) => a.name === b.name,
  });

  const columns: ICell[] = [
    {
      // Using a custom column instead of Table's onSelect prop due to issues
      title: (
        <input
          type="checkbox"
          aria-label="Select all providers"
          onChange={(event: React.FormEvent<HTMLInputElement>) => {
            selectAll(event.currentTarget.checked);
          }}
          checked={areAllSelected}
        />
      ),
      columnTransforms: [classNamesTransform(tableStyles.tableCheck)],
    },
    { title: 'Name', transforms: [sortable] },
    { title: 'Endpoint', transforms: [sortable] },
    { title: 'Clusters', transforms: [sortable] },
    { title: 'Hosts', transforms: [sortable] },
    { title: 'VMs', transforms: [sortable] },
    { title: 'Networks', transforms: [sortable] },
    { title: 'Datastores', transforms: [sortable] },
    { title: 'Status', transforms: [sortable] },
    { title: '', columnTransforms: [classNamesTransform(tableStyles.tableAction)] },
  ];

  const rows: IRow[] = [];
  currentPageItems.forEach((provider: IVMwareProvider) => {
    const { clusterCount, hostCount, vmCount, networkCount, datastoreCount } = provider;
    const isSelected = isItemSelected(provider);
    const isExpanded = isItemExpanded(provider);
    rows.push({
      meta: { provider },
      isOpen: isExpanded,
      cells: [
        {
          title: (
            <input
              type="checkbox"
              aria-label={`Select provider ${provider.name}`}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                toggleItemSelected(provider, event.currentTarget.checked);
              }}
              checked={isSelected}
            />
          ),
        },
        provider.name,
        provider.object.spec.url,
        clusterCount,
        {
          /*
          // TODO (post-beta): reintroduce the link to /providers/* when we resolve https://github.com/konveyor/virt-ui/issues/138
          title: (
            <>
              <Link to={`/providers/${provider.name}`}>
                <OutlinedHddIcon key="hosts-icon" /> {hostCount}
              </Link>
            </>
          ),
          */
          title: hostCount,
        },
        vmCount,
        networkCount,
        datastoreCount,
        {
          title: <ProviderStatus provider={provider} />,
        },
        {
          title: (
            <ProviderActionsDropdown provider={provider} providerType={ProviderType.vsphere} />
          ),
        },
      ],
    });
  });

  const [isDownload, setDownload] = React.useReducer((isDownload) => !isDownload, false);

  return (
    <>
      <Level>
        <LevelItem>
          {isDownload ? (
            <DownloadButton providers={selectedItems} setDownload={setDownload} />
          ) : (
            <Button
              variant="secondary"
              onClick={setDownload}
              isDisabled={selectedItems.length === 0}
            >
              Download data
            </Button>
          )}
        </LevelItem>
        <LevelItem>
          <Pagination {...paginationProps} widgetId="providers-table-pagination-top" />
        </LevelItem>
      </Level>
      <Table
        aria-label="VMware providers table"
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

export default VMwareProvidersTable;
