import * as React from 'react';
import { Pagination, Level, LevelItem } from '@patternfly/react-core';
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

import { useSortState, usePaginationState } from '@app/common/hooks';
import { IVMwareProvider } from '@app/queries/types';
import ProviderActionsDropdown from '../ProviderActionsDropdown';
import ProviderStatus from '../ProviderStatus';
import { mostSeriousCondition } from '@app/common/helpers';

import './VMwareProvidersTable.css';
import { ProviderType } from '@app/common/constants';
import { Link } from 'react-router-dom';
import { OutlinedHddIcon } from '@patternfly/react-icons';

interface IVMwareProvidersTableProps {
  providers: IVMwareProvider[];
}

const VMwareProvidersTable: React.FunctionComponent<IVMwareProvidersTableProps> = ({
  providers,
}: IVMwareProvidersTableProps) => {
  const getSortValues = (provider: IVMwareProvider) => {
    const { clusterCount, hostCount, vmCount, networkCount, datastoreCount } = provider;
    return [
      // TODO restore this when https://github.com/konveyor/virt-ui/issues/281 is settled
      // '',
      provider.name,
      provider.object.spec.url || '',
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

  /* TODO restore this when https://github.com/konveyor/virt-ui/issues/281 is settled
  const {
    selectedItems,
    toggleItemSelected,
    areAllSelected,
    selectAll,
    isItemSelected,
  } = useSelectionState<IVMwareProvider>({ items: sortedItems });

  const inventoryDownloadURL = `/inventory-payload-api/api/v1/extract?providers=${selectedItems
    .map((provider) => `${provider.namespace}/${provider.name}`)
    .join()}`;
  */

  const columns: ICell[] = [
    /* TODO restore this when https://github.com/konveyor/virt-ui/issues/281 is settled
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
    */
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
    // TODO restore this when https://github.com/konveyor/virt-ui/issues/281 is settled
    // const isSelected = isItemSelected(provider);
    rows.push({
      meta: { provider },
      cells: [
        /* TODO restore this when https://github.com/konveyor/virt-ui/issues/281 is settled
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
        */
        provider.name,
        provider.object.spec.url,
        clusterCount,
        {
          title: (
            <>
              <Link to={`/providers/${provider.name}`}>
                <OutlinedHddIcon key="hosts-icon" /> {hostCount}
              </Link>
            </>
          ),
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

  return (
    <>
      <Level>
        <LevelItem>
          {/* TODO restore this when https://github.com/konveyor/virt-ui/issues/281 is settled
          <Button
            variant="secondary"
            component="a"
            href={inventoryDownloadURL}
            isDisabled={selectedItems.length === 0}
          >
            Download data
          </Button>
          */}
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
