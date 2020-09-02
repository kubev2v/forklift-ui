import * as React from 'react';
import {
  Mapping,
  MappingType,
  INetworkMapping,
  IStorageMapping,
  ICommonMapping,
  INetworkMappingItem,
  IStorageMappingItem,
} from '../types';
import { Level, LevelItem, Button, Pagination } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
  ICell,
  sortable,
  compoundExpand,
  classNames as classNamesTransform,
  IRow,
} from '@patternfly/react-table';
import { useSortState, usePaginationState, useSelectionState } from '@app/common/hooks';
import { IVMwareProvider } from '@app/Providers/types';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';
import { OutlinedHddIcon } from '@patternfly/react-icons';
import ProviderStatus from '@app/Providers/components/ProvidersTable/ProviderStatus';
import VMwareProviderActionsDropdown from '@app/Providers/components/ProvidersTable/VMware/VMwareProviderActionsDropdown';
import VMwareProviderHostsTable from '@app/Providers/components/ProvidersTable/VMware/VMwareProviderHostsTable';
import MappingsActionsDropdown from './MappingsActionsDropdown';

interface IMappingsTableProps {
  mappings: Mapping[];
  mappingType: string;
  toggleAddEditModal: () => void;
}

const MappingsTable: React.FunctionComponent<IMappingsTableProps> = ({
  mappings,
  mappingType,
  toggleAddEditModal,
}: IMappingsTableProps) => {
  const getSortValues = (mapping: ICommonMapping) => {
    const { name, sourceProvider, targetProvider } = mapping;
    return [name, sourceProvider.name, targetProvider.name, ''];
  };

  const { sortBy, onSort, sortedItems } = useSortState(mappings, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const {
    selectedItems: expandedMappings,
    toggleItemSelected: toggleMappingExpanded,
  } = useSelectionState<ICommonMapping>(sortedItems);

  const columns: ICell[] = [
    { title: 'Name', transforms: [sortable] },
    { title: 'Source provider', transforms: [sortable] },
    { title: 'Target provider', transforms: [sortable] },
    { title: 'Network mappings', transforms: [sortable] },
    { title: '', columnTransforms: [classNamesTransform(tableStyles.tableAction)] },
  ];

  const rows: IRow[] = [];
  currentPageItems.forEach((mapping: ICommonMapping) => {
    const { name, sourceProvider, targetProvider, items } = mapping;
    const isExpanded = expandedMappings.includes(mapping);
    rows.push({
      meta: { mapping },
      isOpen: isExpanded,
      cells: [
        name,
        sourceProvider.name,
        targetProvider.name,
        {
          title: (
            <>
              <OutlinedHddIcon key="hosts-icon" /> {items ? items.length : 0}
            </>
          ),
          props: {
            isOpen: isExpanded,
          },
        },
        {
          title: <MappingsActionsDropdown />,
        },
      ],
    });
    if (isExpanded) {
      rows.push({
        parent: rows.length - 1,
        compoundExpand: 4,
        cells: [
          {
            title: (
              <div>
                mapping details table
                {/* <MappingDetailsTable provider={provider} /> */}
              </div>
            ),
            props: { colSpan: columns.length, className: tableStyles.modifiers.noPadding },
          },
        ],
      });
    }
  });
  // TODO: the storage and network mappings tables seem similar enough that we
  // can probably implement them in one place with props for the different sets
  // of data. Code specific to networks and storages could be in separate helpers.
  // If this turns out to be a pain, we could make NetworkMappingsTable
  // and StorageMappingsTable separately.

  // I wonder if we can make use of generics right in the props interface?
  // Might be overkill: https://wanago.io/2020/03/09/functional-react-components-with-generic-props-in-typescript/

  // TODO remove this stuff, just demonstrating how we can handle these types maybe?
  // These kind of checks can be in helpers instead of here.
  mappings.forEach((m) => {
    if (m.type === MappingType.Network) {
      const mapping = m as INetworkMapping;
      console.log('Do something with network mapping', mapping);
    }
    if (m.type === MappingType.Storage) {
      const mapping = m as IStorageMapping;
      console.log('Do something with storage mapping', mapping);
    }
    return {};
  });

  return (
    <>
      <Level>
        <LevelItem>
          <Button
            key="confirm"
            variant="primary"
            onClick={() => {
              //TODO: Replace with a real redux call for adding a mapping
              toggleAddEditModal();
            }}
          >
            Add mapping
          </Button>
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
          toggleMappingExpanded(rowData.meta.provider);
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

export default MappingsTable;
