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
  fitContent,
} from '@patternfly/react-table';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';

import { useSortState, usePaginationState } from '@app/common/hooks';
import {
  ICorrelatedProvider,
  IRHVProvider,
  IVMwareProvider,
  SourceInventoryProvider,
} from '@app/queries/types';
import ProviderActionsDropdown from '../ProviderActionsDropdown';
import StatusCondition from '@app/common/components/StatusCondition';
import { getMostSeriousCondition, hasCondition, numStr } from '@app/common/helpers';

import { PlanStatusType, ProviderType, PROVIDER_TYPE_NAMES } from '@app/common/constants';
import { Link } from 'react-router-dom';
import { OutlinedHddIcon } from '@patternfly/react-icons';

interface ISourceProvidersTableProps<T extends SourceInventoryProvider> {
  providers: ICorrelatedProvider<T>[];
  providerType: ProviderType;
}

const SourceProvidersTable = <T extends SourceInventoryProvider>({
  providers,
  providerType,
}: React.PropsWithChildren<ISourceProvidersTableProps<T>>): JSX.Element | null => {
  let storageTitle = '';
  if (providerType === 'vsphere') storageTitle = 'Datastores';
  if (providerType === 'ovirt') storageTitle = 'Storage domains';

  const getStorageCount = (provider: ICorrelatedProvider<SourceInventoryProvider>) => {
    if (!provider.inventory) return 0;
    if (providerType === 'vsphere') {
      return (provider.inventory as IVMwareProvider).datastoreCount;
    }
    if (providerType === 'ovirt') {
      return (provider.inventory as IRHVProvider).storageDomainCount;
    }
    return 0;
  };

  const getSortValues = (provider: ICorrelatedProvider<SourceInventoryProvider>) => {
    const { clusterCount, hostCount, vmCount, networkCount } = provider.inventory || {};
    return [
      // TODO restore this when https://github.com/konveyor/forklift-ui/issues/281 is settled
      // '',
      provider.metadata.name,
      provider.spec.url || '',
      numStr(clusterCount),
      numStr(hostCount),
      numStr(vmCount),
      numStr(networkCount),
      numStr(getStorageCount(provider)),
      provider.status ? getMostSeriousCondition(provider.status?.conditions) : '',
      '',
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(providers, getSortValues);
  // TODO currentPageItems has type any, we should add generics to usePaginationState
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  /* TODO restore this when https://github.com/konveyor/forklift-ui/issues/281 is settled
  const {
    selectedItems,
    toggleItemSelected,
    areAllSelected,
    selectAll,
    isItemSelected,
  } = useSelectionState<ICorrelatedProvider<SourceInventoryProvider>>({ items: sortedItems });

  const inventoryDownloadURL = `/inventory-payload-api/api/v1/extract?providers=${selectedItems
    .map((provider) => `${provider.namespace}/${provider.name}`)
    .join()}`;
  */

  const columns: ICell[] = [
    /* TODO restore this when https://github.com/konveyor/forklift-ui/issues/281 is settled
    {
      // Using a custom column instead of Table's onSelect prop due to issues
      // TODO replace it with the onSelect prop of table like in https://github.com/konveyor/forklift-ui/pull/317
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
    { title: storageTitle, transforms: [sortable, fitContent] },
    { title: 'Status', transforms: [sortable] },
    { title: '', columnTransforms: [classNamesTransform(tableStyles.tableAction)] },
  ];

  const rows: IRow[] = [];
  currentPageItems.forEach((provider: ICorrelatedProvider<SourceInventoryProvider>) => {
    const { clusterCount, hostCount, vmCount, networkCount } = provider.inventory || {};
    // TODO restore this when https://github.com/konveyor/forklift-ui/issues/281 is settled
    // const isSelected = isItemSelected(provider);

    rows.push({
      meta: { provider },
      cells: [
        /* TODO restore this when https://github.com/konveyor/forklift-ui/issues/281 is settled
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
        provider.metadata.name,
        provider.spec.url,
        numStr(clusterCount),
        (() => {
          if (hostCount === undefined) return '';
          if (providerType === 'vsphere') {
            const hostCountWithIcon = (
              <>
                <OutlinedHddIcon key="hosts-icon" /> {hostCount}
              </>
            );
            return {
              title: hasCondition(provider.status?.conditions || [], PlanStatusType.Ready) ? (
                <Link to={`/providers/vsphere/${provider.metadata.name}`}>{hostCountWithIcon}</Link>
              ) : (
                hostCountWithIcon
              ),
            };
          }
          if (providerType === 'ovirt') {
            return hostCount;
          }
          return null;
        })(),
        numStr(vmCount),
        numStr(networkCount),
        numStr(getStorageCount(provider)),
        {
          title: <StatusCondition status={provider.status} />,
        },
        {
          title: <ProviderActionsDropdown provider={provider} providerType={providerType} />,
        },
      ],
    });
  });

  return (
    <>
      <Level>
        <LevelItem>
          {/* TODO restore this when https://github.com/konveyor/forklift-ui/issues/281 is settled
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
        aria-label={`${PROVIDER_TYPE_NAMES[providerType]} providers table`}
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

export default SourceProvidersTable;
