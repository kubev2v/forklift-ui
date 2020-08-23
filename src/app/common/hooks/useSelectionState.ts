import * as React from 'react';

export interface ISelectionStateHook<T> {
  selectedItems: T[];
  toggleItemSelected: (item: T, isSelecting?: boolean) => void;
  selectAll: (isSelecting?: boolean) => void;
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

  // Preserve original order of items
  const selectedItemsInOrder = items.filter((i) => selectedItems.includes(i));

  return { selectedItems: selectedItemsInOrder, toggleItemSelected, selectAll };
};
