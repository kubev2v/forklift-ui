import * as React from 'react';
import { Pagination, TextContent, Text, Alert } from '@patternfly/react-core';
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

import { useSortState, usePaginationState } from '@app/common/hooks';
import { PlanWizardFormState } from './PlanWizard';
import { getAvailableVMs, getVMTreePathInfoByVM } from './helpers';
import { useVMwareTreeQuery, useVMwareVMsQuery } from '@app/queries';
import { getAggregateQueryStatus } from '@app/queries/helpers';
import { QueryStatus } from 'react-query';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import TableEmptyState from '@app/common/components/TableEmptyState';
import VMConcernsIcon from './VMConcernsIcon';
import VMConcernsDescription from './VMConcernsDescription';

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

  const { availableVMs, treePathInfoByVM } = React.useMemo(() => {
    const availableVMs = getAvailableVMs(selectedTreeNodes, vmsQuery.data || []);
    const treePathInfoByVM = getVMTreePathInfoByVM(
      availableVMs,
      hostTreeQuery.data || null,
      vmTreeQuery.data || null
    );
    return { availableVMs, treePathInfoByVM };
  }, [selectedTreeNodes, hostTreeQuery.data, vmTreeQuery.data, vmsQuery.data]);

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

  const { sortBy, onSort, sortedItems } = useSortState(availableVMs, getSortValues);
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
    return <Alert variant="danger" title="Error loading VMware tree data" />;
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
          Select VMs for migration. The Migration analysis column shows the risk associated with
          migrating a VM as determined by Red Hat&lsquo;s Migration Analytics service. The Flags
          indicate the reason for that risk assement.
        </Text>
      </TextContent>
      <Pagination {...paginationProps} widgetId="vms-table-pagination-top" />
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
      <Pagination {...paginationProps} widgetId="vms-table-pagination-bottom" variant="bottom" />
    </>
  );
};

export default SelectVMsForm;
