import * as React from 'react';
import {
  Pagination,
  TextContent,
  Text,
  Level,
  LevelItem,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  Table,
  TableHeader,
  TableBody,
  TableVariant,
  sortable,
  ICell,
  IRow,
  wrappable,
  truncate,
} from '@patternfly/react-table';

import {
  SourceVM,
  IInventoryHostTree,
  IVMwareFolderTree,
  SourceInventoryProvider,
  InventoryTree,
  InventoryTreeType,
} from '@app/queries/types';
import { useSelectionState } from '@konveyor/lib-ui';

import { useSortState, usePaginationState, useFilterState } from '@app/common/hooks';
import { PlanWizardFormState } from './PlanWizard';
import {
  getAvailableVMs,
  getMostSevereVMConcern,
  getVMConcernStatusLabel,
  getVMTreePathInfoByVM,
  IVMTreePathInfo,
  IVMTreePathInfoByVM,
  vmMatchesConcernFilter,
} from './helpers';
import { useInventoryTreeQuery, useSourceVMsQuery } from '@app/queries';
import TableEmptyState from '@app/common/components/TableEmptyState';
import { FilterToolbar, FilterType, FilterCategory } from '@app/common/components/FilterToolbar';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';
import VMConcernsIcon from './VMConcernsIcon';
import VMConcernsDescription from './VMConcernsDescription';
import { LONG_LOADING_MESSAGE } from '@app/queries/constants';

interface ISelectVMsFormProps {
  form: PlanWizardFormState['selectVMs'];
  selectedTreeNodes: InventoryTree[];
  sourceProvider: SourceInventoryProvider | null;
  selectedVMs: SourceVM[];
}

const SelectVMsForm: React.FunctionComponent<ISelectVMsFormProps> = ({
  form,
  selectedTreeNodes,
  sourceProvider,
  selectedVMs,
}: ISelectVMsFormProps) => {
  const hostTreeQuery = useInventoryTreeQuery<IInventoryHostTree>(
    sourceProvider,
    InventoryTreeType.Cluster
  );
  const vmTreeQuery = useInventoryTreeQuery<IVMwareFolderTree>(
    sourceProvider,
    InventoryTreeType.VM
  );
  const vmsQuery = useSourceVMsQuery(sourceProvider);

  // Even if some of the already-selected VMs don't match the filter, include them in the list.
  const selectedVMsOnMount = React.useRef(selectedVMs);
  const [availableVMs, setAvailableVMs] = React.useState<SourceVM[] | null>(null);
  React.useEffect(() => {
    if (vmsQuery.data) {
      const filteredVMs = getAvailableVMs(selectedTreeNodes, vmsQuery.data || []);
      setAvailableVMs([
        ...selectedVMsOnMount.current,
        ...filteredVMs.filter(
          (vm) => !selectedVMsOnMount.current.some((selectedVM) => vm.id === selectedVM.id)
        ),
      ]);
    }
  }, [vmsQuery.data, selectedTreeNodes]);

  const [treePathInfoByVM, setTreePathInfoByVM] = React.useState<IVMTreePathInfoByVM | null>(null);
  React.useEffect(() => {
    if (
      (availableVMs || []).length > 0 &&
      hostTreeQuery.data &&
      (sourceProvider?.type === 'ovirt' || vmTreeQuery.data) // Only VMware has a VM tree
    ) {
      setTreePathInfoByVM(
        getVMTreePathInfoByVM(
          availableVMs?.map((vm) => vm.selfLink) || [],
          hostTreeQuery.data,
          vmTreeQuery.data || null
        )
      );
    }
  }, [availableVMs, hostTreeQuery.data, sourceProvider?.type, vmTreeQuery.data]);
  const getVMTreeInfo = (vm: SourceVM): IVMTreePathInfo => {
    if (treePathInfoByVM) return treePathInfoByVM[vm.selfLink];
    return { datacenter: null, cluster: null, host: null, folders: null, folderPathStr: null };
  };

  const filterCategories: FilterCategory<SourceVM>[] = [
    {
      key: 'name',
      title: 'VM name',
      type: FilterType.search,
      placeholderText: 'Filter by VM ...',
    },
    {
      key: 'migrationAnalysis',
      title: 'Migration assessment',
      type: FilterType.select,
      selectOptions: [
        { key: 'Ok', value: 'Ok' },
        { key: 'Advisory', value: 'Advisory' },
        { key: 'Warning', value: 'Warning' },
        { key: 'Critical', value: 'Critical' },
      ],
      getItemValue: (item) => {
        const worstConcern = getMostSevereVMConcern(item);
        return getVMConcernStatusLabel(worstConcern);
      },
    },
    {
      key: 'analysisCondition',
      title: 'Assessment condition',
      type: FilterType.search,
      placeholderText: 'Filter by assessment condition...',
      getItemValue: (item) => {
        // Mash all the concerns together to match against them as a continuous string
        const concernStrings = item.concerns.map(
          (concern) => `${concern.category} - ${concern.label}: ${concern.assessment}`
        );
        return concernStrings.join(' ; ');
      },
    },
    {
      key: 'dataCenter',
      title: 'Datacenter',
      type: FilterType.search,
      placeholderText: 'Filter by datacenter ...',
      getItemValue: (item) => {
        const { datacenter } = getVMTreeInfo(item);
        return datacenter ? datacenter.name : '';
      },
    },
    {
      key: 'cluster',
      title: 'Cluster',
      type: FilterType.search,
      placeholderText: 'Filter by cluster ...',
      getItemValue: (item) => {
        const { cluster } = getVMTreeInfo(item);
        return cluster ? cluster.name : '';
      },
    },
    {
      key: 'host',
      title: 'Host',
      type: FilterType.search,
      placeholderText: 'Filter by hostname...',
      getItemValue: (item) => {
        const { host } = getVMTreeInfo(item);
        return host ? host.name : '';
      },
    },
    ...(sourceProvider?.type === 'vsphere'
      ? [
          {
            key: 'folderPath',
            title: 'Folder path',
            type: FilterType.search,
            placeholderText: 'Filter by folder path ...',
            getItemValue: (item) => {
              const { folderPathStr } = getVMTreeInfo(item);
              return folderPathStr ? folderPathStr : '';
            },
          },
        ]
      : []),
  ];

  const { filterValues, setFilterValues, filteredItems } = useFilterState(
    availableVMs || [],
    filterCategories
  );

  const getSortValues = (vm: SourceVM) => {
    const { datacenter, cluster, host, folderPathStr } = getVMTreeInfo(vm);
    return [
      '', // Expand control column
      '', // Checkbox column
      getVMConcernStatusLabel(getMostSevereVMConcern(vm)),
      vm.name,
      datacenter?.name || '',
      cluster?.name || '',
      host?.name || '',
      ...(sourceProvider?.type === 'vsphere' ? [folderPathStr || ''] : []),
      '', // Action column
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(filteredItems, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const { isItemSelected, toggleItemSelected, selectAll } = useSelectionState<string>({
    items: sortedItems.map((vm) => vm.id),
    externalState: [form.fields.selectedVMIds.value, form.fields.selectedVMIds.setValue],
  });

  const { toggleItemSelected: toggleVMExpanded, isItemSelected: isVMExpanded } =
    useSelectionState<SourceVM>({
      items: sortedItems,
      isEqual: (a, b) => a.selfLink === b.selfLink,
    });

  React.useEffect(() => {
    if (filterValues.analysisCondition) {
      const filterText = filterValues.analysisCondition[0];
      const firstMatchingVM = sortedItems.find((vm) => vmMatchesConcernFilter(vm, filterText));
      if (firstMatchingVM && !isVMExpanded(firstMatchingVM)) {
        toggleVMExpanded(firstMatchingVM);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues.analysisCondition]);

  const columns: ICell[] = [
    {
      title: 'Migration assessment',
      transforms: [sortable],
      cellTransforms: [truncate],
    },
    { title: 'VM name', transforms: [sortable], cellTransforms: [truncate] },
    { title: 'Datacenter', transforms: [sortable], cellTransforms: [truncate] },
    { title: 'Cluster', transforms: [sortable], cellTransforms: [truncate] },
    { title: 'Host', transforms: [sortable, wrappable], cellTransforms: [truncate] },
    ...(sourceProvider?.type === 'vsphere'
      ? [{ title: 'Folder path', transforms: [sortable, wrappable], cellTransforms: [truncate] }]
      : []),
  ];

  const rows: IRow[] = [];

  currentPageItems.forEach((vm: SourceVM) => {
    const isExpanded = isVMExpanded(vm);
    const { datacenter, cluster, host, folderPathStr } = getVMTreeInfo(vm);
    rows.push({
      meta: { vm },
      selected: isItemSelected(vm.id),
      isOpen: isExpanded,
      cells: [
        {
          title: <VMConcernsIcon vm={vm} />,
        },
        vm.name,
        datacenter?.name || '',
        cluster?.name || '',
        host?.name || '',
        ...(sourceProvider?.type === 'vsphere' ? [folderPathStr || ''] : []),
      ],
    });
    if (isExpanded) {
      rows.push({
        parent: rows.length - 1,
        fullWidth: true,
        cells: [
          {
            title: (
              <VMConcernsDescription
                vm={vm}
                filterText={
                  (filterValues.analysisCondition && filterValues.analysisCondition[0]) || ''
                }
              />
            ),
            props: { colSpan: columns.length + 2 },
          },
        ],
      });
    }
  });

  return (
    <ResolvedQueries
      results={[
        hostTreeQuery,
        ...(sourceProvider?.type === 'vsphere' ? [vmTreeQuery] : []),
        vmsQuery,
      ]}
      errorTitles={[
        'Error loading inventory host tree data',
        ...(sourceProvider?.type === 'vsphere' ? ['Error loading inventory VM tree data'] : []),
        'Error loading VMs',
      ]}
      emptyStateBody={LONG_LOADING_MESSAGE}
      forceLoadingState={!availableVMs}
    >
      {(availableVMs || []).length === 0 ? (
        <TableEmptyState
          titleText="No VMs found"
          bodyText="No results match your filter. Go back and make a different selection."
        />
      ) : (
        <>
          <TextContent className={spacing.mbMd}>
            <Text component="p">
              Select VMs for migration. The Migration assessment column highlights conditions
              related to migrating a particular VM, as determined by Red Hat&apos;s migration
              analytics service.
            </Text>
          </TextContent>
          <Split>
            <SplitItem isFilled>
              <FilterToolbar<SourceVM>
                filterCategories={filterCategories}
                filterValues={filterValues}
                setFilterValues={setFilterValues}
              />
            </SplitItem>
            <SplitItem>
              <Pagination
                className={spacing.mtMd}
                {...paginationProps}
                widgetId="vms-table-pagination-top"
              />
            </SplitItem>
          </Split>
          {filteredItems.length > 0 ? (
            <Table
              aria-label="VMware VMs table"
              variant={TableVariant.compact}
              cells={columns}
              rows={rows}
              sortBy={sortBy}
              onSort={onSort}
              onSelect={(_event, isSelected, rowIndex, rowData) => {
                if (rowIndex === -1) {
                  selectAll(isSelected);
                } else {
                  toggleItemSelected(rowData.meta.vm.id, isSelected);
                }
              }}
              onCollapse={(_event, _rowKey, _isOpen, rowData) => {
                toggleVMExpanded(rowData.meta.vm);
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
                >{`${form.values.selectedVMIds.length} selected`}</Text>
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
      )}
    </ResolvedQueries>
  );
};

export default SelectVMsForm;
