import * as React from 'react';
import { Pagination } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  sortable,
  compoundExpand,
  classNames as classNamesTransform,
  ICell,
  IRow,
  wrappable,
} from '@patternfly/react-table';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';

import { IVMs } from '../../types';
import { useSortState, usePaginationState, useSelectionState } from '@app/common/hooks';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';

interface ISelectVMsProps {
  VMs: IVMs[];
}

const SelectVMs: React.FunctionComponent<ISelectVMsProps> = ({ VMs }: ISelectVMsProps) => {
  const getSortValues = (vm: IVMs) => {
    return ['', vm.Name, vm.Datacenter, vm.Cluster, vm.Host, vm.FolderPath, ''];
  };

  const { sortBy, onSort, sortedItems } = useSortState(VMs, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const { selectedItems, toggleItemSelected, areAllSelected, selectAll } = useSelectionState<IVMs>(
    sortedItems
  );

  const { selectedItems: expandedVMs, toggleItemSelected: toggleVMExpanded } = useSelectionState<
    IVMs
  >(sortedItems);

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
    },
    {
      title: 'Migration Analysis',
      transforms: [sortable, wrappable],
      cellTransforms: [compoundExpand],
    },
    { title: 'VM Name', transforms: [sortable, wrappable] },
    { title: 'Datacenter', transforms: [sortable] },
    { title: 'Cluster', transforms: [sortable] },
    { title: 'Host', transforms: [sortable] },
    { title: 'Folder Path', transforms: [sortable, wrappable] },
  ];

  const rows: IRow[] = [];

  currentPageItems.forEach((vm: IVMs) => {
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
    if (isExpanded) {
      rows.push({
        parent: 1,
        compoundExpand: 1,
        cells: [
          {
            title: <div>TODO: Migration Analysis response</div>,
          },
        ],
      });
    }
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
        variant="compact"
        cells={columns}
        rows={rows}
        sortBy={sortBy}
        onSort={onSort}
        onExpand={(_event, _rowIndex, _colIndex, _isOpen, rowData) => {
          toggleVMExpanded(rowData.meta.vm);
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
