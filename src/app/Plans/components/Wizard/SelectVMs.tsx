import * as React from 'react';
import { Pagination } from '@patternfly/react-core';
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

import { IVM } from '../../types';
import { useSelectionState } from '@konveyor/lib-ui';

import { useSortState, usePaginationState } from '@app/common/hooks';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';

interface ISelectVMsProps {
  vms: IVM[];
}

const SelectVMs: React.FunctionComponent<ISelectVMsProps> = ({ vms }: ISelectVMsProps) => {
  const getSortValues = (vm: IVM) => {
    return [
      '', // Expand control column
      '', // Checkbox column
      vm.MigrationAnalysis,
      vm.Name,
      vm.Datacenter,
      vm.Cluster,
      vm.Host,
      vm.FolderPath,
      '', // Action column
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(vms, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const { selectedItems, toggleItemSelected, areAllSelected, selectAll } = useSelectionState<IVM>({
    items: sortedItems,
  });

  const {
    selectedItems: expandedVMs,
    toggleItemSelected: toggleVMsExpanded,
    isItemSelected,
  } = useSelectionState<IVM>({
    items: sortedItems,
    isEqual: (a, b) => a.Name === b.Name,
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
      title: 'Migration Analysis',
      transforms: [sortable, wrappable],
    },
    { title: 'VM Name', transforms: [sortable, wrappable] },
    { title: 'Datacenter', transforms: [sortable] },
    { title: 'Cluster', transforms: [sortable] },
    { title: 'Host', transforms: [sortable] },
    { title: 'Folder Path', transforms: [sortable, wrappable] },
  ];

  const rows: IRow[] = [];

  currentPageItems.forEach((vm: IVM) => {
    const isSelected = selectedItems.includes(vm);
    const isExpanded = expandedVMs.includes(vm);
    rows.push({
      meta: { vm },
      isOpen: isExpanded,
      cells: [
        {
          title: (
            <input
              type="checkbox"
              aria-label={`Select vm ${vm.Name}`}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                toggleItemSelected(vm, event.currentTarget.checked);
              }}
              checked={isSelected}
            />
          ),
        },
        {
          title: (
            <StatusIcon status={StatusType[vm.MigrationAnalysis]} label={vm.MigrationAnalysis} />
          ),
        },
        vm.Name,
        vm.Datacenter,
        vm.Cluster,
        vm.Host,
        vm.FolderPath,
      ],
    });
    rows.push({
      parent: rows.length - 1,
      fullWidth: true,
      cells: [vm.MAStory],
    });
  });

  return (
    <>
      <div>
        Select VMs for migration. The Migration analysis column shows the risk associated with
        migrating a VM as determined by Red Hat&lsquo;s Migration Analytics service. The Flags
        indicate the reason for that risk assement.
      </div>
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

export default SelectVMs;
