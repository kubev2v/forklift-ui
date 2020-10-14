import * as React from 'react';
import { IFilterValues, FilterCategory } from '../components/FilterToolbar';
import { IPlan } from '@app/queries/types';

export interface IFilterStateHook<T> {
  filterValues: IFilterValues;
  setFilterValues: (values: IFilterValues) => void;
  filteredItems: T[];
}

export const useFilterState = (
  items: IPlan[],
  filterCategories: FilterCategory[]
): IFilterStateHook<IPlan> => {
  const [filterValues, setFilterValues] = React.useState<IFilterValues>({});

  const filteredItems = items.filter((item) =>
    Object.keys(filterValues).every((categoryKey) => {
      const values = filterValues[categoryKey];
      if (!values || values.length === 0) return true;
      const filterCategory = filterCategories.find((category) => category.key === categoryKey);
      let itemValue = item[categoryKey];
      if (filterCategory?.getItemValue) {
        itemValue = filterCategory.getItemValue(item);
      }
      return values.every((filterValue) => (itemValue ? itemValue.includes(filterValue) : false));
    })
  );
  return { filterValues, setFilterValues, filteredItems };
};
