import * as React from 'react';
import { Level, LevelItem, Button, Pagination } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  Table,
  TableHeader,
  TableBody,
  ICell,
  sortable,
  classNames as classNamesTransform,
  IRow,
  expandable,
} from '@patternfly/react-table';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';
import { useSelectionState } from '@konveyor/lib-ui';
import { useSortState, usePaginationState } from '@app/common/hooks';
import { Mapping, MappingType, INetworkMapping, IStorageMapping } from '@app/queries/types';
import MappingsActionsDropdown from './MappingsActionsDropdown';
import MappingDetailView from './MappingDetailView';

interface IMappingsTableProps {
  mappings: Mapping[];
  mappingType: MappingType;
  toggleAddEditModal: () => void;
}

const MappingsTable: React.FunctionComponent<IMappingsTableProps> = ({
  mappings,
  mappingType,
  toggleAddEditModal,
}: IMappingsTableProps) => {
  const getSortValues = (mapping: Mapping) => {
    const { name, provider } = mapping;
    return [
      '', // Expand control column
      name,
      provider.source.name,
      provider.target.name,
      '', // Action column
    ];
  };

  const { sortBy, onSort, sortedItems } = useSortState(mappings, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  React.useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const {
    toggleItemSelected: toggleMappingExpanded,
    isItemSelected: isMappingExpanded,
  } = useSelectionState<Mapping>({
    items: sortedItems,
    isEqual: (a, b) => a.name === b.name,
  });

  const columns: ICell[] = [
    { title: 'Name', transforms: [sortable], cellFormatters: [expandable] },
    { title: 'Source provider', transforms: [sortable] },
    { title: 'Target provider', transforms: [sortable] },
    { title: '', columnTransforms: [classNamesTransform(tableStyles.tableAction)] },
  ];

  const rows: IRow[] = [];
  currentPageItems.forEach((mapping: Mapping) => {
    const { name, provider } = mapping;
    const isExpanded = isMappingExpanded(mapping);
    rows.push({
      meta: { mapping },
      isOpen: isExpanded,
      cells: [
        name,
        provider.source?.name,
        provider.target?.name,
        {
          title: <MappingsActionsDropdown />,
        },
      ],
    });
    if (isExpanded) {
      rows.push({
        parent: rows.length - 1,
        fullWidth: true,
        cells: [
          {
            title: (
              <MappingDetailView
                mappingType={mappingType}
                mapping={mapping}
                className={spacing.mLg}
              />
            ),
            props: { colSpan: columns.length + 1, className: tableStyles.modifiers.noPadding },
          },
        ],
      });
    }
  });
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
        aria-label="Mappings table"
        cells={columns}
        rows={rows}
        sortBy={sortBy}
        onSort={onSort}
        onCollapse={(event, rowKey, isOpen, rowData) => {
          toggleMappingExpanded(rowData.meta.mapping);
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
