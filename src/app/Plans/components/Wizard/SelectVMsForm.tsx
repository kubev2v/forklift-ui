import * as React from 'react';
import { Pagination, TextContent, Text, Alert, Level, LevelItem } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  Table,
  TableHeader,
  TableBody,
  TableVariant,
  sortable,
  classNames as classNamesTransform,
  ICell,
  IRow,
  wrappable,
  expandable,
} from '@patternfly/react-table';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';

import {
  IVMwareHostTree,
  IVMwareProvider,
  IVMwareVM,
  IVMwareVMTree,
  VMwareTree,
  VMwareTreeType,
} from '@app/queries/types';
import { useSelectionState } from '@konveyor/lib-ui';

import { useSortState, usePaginationState, useFilterState } from '@app/common/hooks';
import { PlanWizardFormState } from './PlanWizard';
import { getAvailableVMs, getMostSevereVMConcern, getVMTreePathInfoByVM } from './helpers';
import { useVMwareTreeQuery, useVMwareVMsQuery } from '@app/queries';
import { getAggregateQueryStatus } from '@app/queries/helpers';
import { QueryStatus } from 'react-query';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import TableEmptyState from '@app/common/components/TableEmptyState';
import VMConcernsIcon from './VMConcernsIcon';
import VMConcernsDescription from './VMConcernsDescription';
import { FilterToolbar, FilterType, FilterCategory } from '@app/common/components/FilterToolbar';

interface ISelectVMsFormProps {
  form: PlanWizardFormState['selectVMs'];
  selectedTreeNodes: VMwareTree[];
  sourceProvider: IVMwareProvider | null;
}

const SelectVMsForm: React.FunctionComponent<ISelectVMsFormProps> = ({
  form,
  selectedTreeNodes,
  sourceProvider,
}: ISelectVMsFormProps) => {
  const hostTreeQuery = useVMwareTreeQuery<IVMwareHostTree>(sourceProvider, VMwareTreeType.Host);
  const vmTreeQuery = useVMwareTreeQuery<IVMwareVMTree>(sourceProvider, VMwareTreeType.VM);
  const treeQueriesStatus = getAggregateQueryStatus([hostTreeQuery, vmTreeQuery]);
  const vmsQuery = useVMwareVMsQuery(sourceProvider);

  // Even if some of the already-selected VMs don't match the filter, include them in the list.
  const selectedVMsOnMount = React.useRef(form.values.selectedVMs);
  const { availableVMs, treePathInfoByVM } = React.useMemo(() => {
    const filteredVMs = getAvailableVMs(selectedTreeNodes, vmsQuery.data || []);
    const availableVMs = [
      ...selectedVMsOnMount.current,
      ...filteredVMs.filter(
        (vm) => !selectedVMsOnMount.current.some((selectedVM) => vm.id === selectedVM.id)
      ),
    ];
    const treePathInfoByVM = getVMTreePathInfoByVM(
      availableVMs,
      hostTreeQuery.data || null,
      vmTreeQuery.data || null
    );
    return { availableVMs, treePathInfoByVM };
  }, [selectedTreeNodes, vmsQuery.data, hostTreeQuery.data, vmTreeQuery.data]);

  const filterCategories: FilterCategory<IVMwareVM>[] = [
    {
      key: 'name',
      title: 'VM name',
      type: FilterType.search,
      placeholderText: 'Filter by VM ...',
    },
    {
      key: 'migrationAnalysis',
      title: 'Migration analysis',
      type: FilterType.select,
      selectOptions: [
        { key: 'Ok', value: 'Ok' },
        { key: 'Advisory', value: 'Advisory' },
        { key: 'Warning', value: 'Warning' },
        { key: 'Critical', value: 'Critical' },
      ],
      getItemValue: (item) => {
        const worstConcern = getMostSevereVMConcern(item);
        return worstConcern ? worstConcern.severity : 'Ok';
      },
    },
    {
      key: 'dataCenter',
      title: 'Datacenter',
      type: FilterType.search,
      placeholderText: 'Filter by datacenter ...',
      getItemValue: (item) => {
        const { datacenter } = treePathInfoByVM[item.selfLink];
        return datacenter ? datacenter.name : '';
      },
    },
    {
      key: 'cluster',
      title: 'Cluster',
      type: FilterType.search,
      placeholderText: 'Filter by cluster ...',
      getItemValue: (item) => {
        const { cluster } = treePathInfoByVM[item.selfLink];
        return cluster ? cluster.name : '';
      },
    },
    {
      key: 'host',
      title: 'Host',
      type: FilterType.search,
      placeholderText: 'Filter by hostname...',
      getItemValue: (item) => {
        const { host } = treePathInfoByVM[item.selfLink];
        return host ? host.name : '';
      },
    },
    {
      key: 'folderPath',
      title: 'Folder path',
      type: FilterType.search,
      placeholderText: 'Filter by folder path ...',
      getItemValue: (item) => {
        const { folderPathStr } = treePathInfoByVM[item.selfLink];
        return folderPathStr ? folderPathStr : '';
      },
    },
  ];

  const { filterValues, setFilterValues, filteredItems } = useFilterState(
    availableVMs,
    filterCategories
  );
  const getSortValues = (vm: IVMwareVM) => {
    const { datacenter, cluster, host, folderPathStr } = treePathInfoByVM[vm.selfLink];
    return [
      '', // Expand control column
      '', // Checkbox column
      'TBD', // Analytics column
      vm.name,
      datacenter?.name || '',
      cluster?.name || '',
      host?.name || '',
      folderPathStr || '',
      '', // Action column
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(filteredItems, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const { isItemSelected, toggleItemSelected, areAllSelected, selectAll } = useSelectionState<
    IVMwareVM
  >({
    items: sortedItems,
    isEqual: (a, b) => a.name === b.name,
    externalState: [form.fields.selectedVMs.value, form.fields.selectedVMs.setValue],
  });

  const { toggleItemSelected: toggleVMsExpanded, isItemSelected: isVMExpanded } = useSelectionState<
    IVMwareVM
  >({
    items: sortedItems,
    isEqual: (a, b) => a.name === b.name,
  });

  const columns: ICell[] = [
    {
      // Using a custom column instead of Table's onSelect prop due to issues
      title: (
        <input
          type="checkbox"
          aria-label="Select all VMs"
          onChange={(event: React.FormEvent<HTMLInputElement>) => {
            selectAll(event.currentTarget.checked);
          }}
          checked={areAllSelected}
        />
      ),
      columnTransforms: [classNamesTransform(tableStyles.tableCheck)],
      cellFormatters: [expandable],
    },
    {
      title: 'Migration analysis',
      transforms: [sortable, wrappable],
    },
    { title: 'VM name', transforms: [sortable, wrappable] },
    { title: 'Datacenter', transforms: [sortable] },
    { title: 'Cluster', transforms: [sortable] },
    { title: 'Host', transforms: [sortable] },
    { title: 'Folder path', transforms: [sortable, wrappable] },
  ];

  const rows: IRow[] = [];

  currentPageItems.forEach((vm: IVMwareVM) => {
    const isSelected = isItemSelected(vm);
    const isExpanded = isVMExpanded(vm);
    const { datacenter, cluster, host, folderPathStr } = treePathInfoByVM[vm.selfLink];
    rows.push({
      meta: { vm },
      isOpen: isExpanded,
      cells: [
        {
          title: (
            <input
              type="checkbox"
              aria-label={`Select vm ${vm.name}`}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                toggleItemSelected(vm, event.currentTarget.checked);
              }}
              checked={isSelected}
            />
          ),
        },
        {
          title: <VMConcernsIcon vm={vm} />,
        },
        vm.name,
        datacenter?.name || '',
        cluster?.name || '',
        host?.name || '',
        folderPathStr || '',
      ],
    });
    if (isExpanded) {
      rows.push({
        parent: rows.length - 1,
        fullWidth: true,
        cells: [{ title: <VMConcernsDescription vm={vm} /> }],
      });
    }
  });

  if (treeQueriesStatus === QueryStatus.Loading || vmsQuery.isLoading) {
    return <LoadingEmptyState />;
  }
  if (treeQueriesStatus === QueryStatus.Error) {
    return <Alert variant="danger" isInline title="Error loading VMware tree data" />;
  }
  if (vmsQuery.isError) {
    return <Alert variant="danger" title="Error loading VMs" />;
  }

  if (availableVMs.length === 0) {
    return (
      <TableEmptyState
        titleText="No VMs found"
        bodyText="No results match your filter. Go back and make a different selection."
      />
    );
  }

  return (
    <>
      <TextContent className={spacing.mbMd}>
        <Text component="p">
          Select VMs for migration. The Migration assessment column highlights conditions related to
          migrating a particular VM, as determined by Red Hat&apos;s migration analytics service.
        </Text>
      </TextContent>
      <Level>
        <LevelItem>
          <FilterToolbar<IVMwareVM>
            filterCategories={filterCategories}
            filterValues={filterValues}
            setFilterValues={setFilterValues}
          />
        </LevelItem>
        <LevelItem>
          <Pagination {...paginationProps} widgetId="vms-table-pagination-top" />
        </LevelItem>
      </Level>
      {filteredItems.length > 0 ? (
        <Table
          aria-label="VMware VMs table"
          variant={TableVariant.compact}
          cells={columns}
          rows={rows}
          sortBy={sortBy}
          onSort={onSort}
          onCollapse={(event, rowKey, isOpen, rowData) => {
            toggleVMsExpanded(rowData.meta.vm);
          }}
        >
          <TableHeader />
          <TableBody />
        </Table>
      ) : (
        <TableEmptyState titleText="No VMs found" bodyText="No results match your filter." />
      )}

      <Level>
        <LevelItem>
          <TextContent>
            <Text
              component="small"
              className={spacing.mlLg}
            >{`${form.values.selectedVMs.length} selected`}</Text>
          </TextContent>
        </LevelItem>
        <LevelItem>
          <Pagination
            {...paginationProps}
            widgetId="vms-table-pagination-bottom"
            variant="bottom"
          />
        </LevelItem>
      </Level>
    </>
  );
};

export default SelectVMsForm;
