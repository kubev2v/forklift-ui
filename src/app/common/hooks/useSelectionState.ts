import * as React from 'react';

export interface ISelectionStateHook<T> {
  selectedItems: T[];
  toggleItemSelected: (item: T, isSelecting?: boolean) => void;
  areAllSelected: boolean;
  selectAll: (isSelecting?: boolean) => void;
  setSelectedItems: (items: T[]) => void;
}

export const useSelectionState = <T>(
  items: T[],
  initialSelected: T[] = []
): ISelectionStateHook<T> => {
  const [selectedItems, setSelectedItems] = React.useState<T[]>(initialSelected);
  const toggleItemSelected = (item: T, isSelecting = !selectedItems.includes(item)) => {
    if (isSelecting) {
      setSelectedItems([...selectedItems, item]);
    } else {
      setSelectedItems(selectedItems.filter((i) => i !== item));
    }
  };
  const selectAll = (isSelecting = true) => setSelectedItems(isSelecting ? items : []);
  const areAllSelected = selectedItems.length === items.length;

  // Preserve original order of items
  let selectedItemsInOrder: T[] = [];
  if (areAllSelected) {
    selectedItemsInOrder = items;
  } else if (selectedItems.length > 0) {
    selectedItemsInOrder = items.filter((i) => selectedItems.includes(i));
  }

  return {
    selectedItems: selectedItemsInOrder,
    toggleItemSelected,
    areAllSelected,
    selectAll,
    setSelectedItems,
  };
};
