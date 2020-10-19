import * as React from 'react';

import {
  FilterCategory,
  FilterValue,
  FilterType,
  ISelectFilterCategory,
  ISearchFilterCategory,
} from './FilterToolbar';
import SelectFilterControl from './SelectFilterControl';
import SearchFilterControl from './SearchFilterControl';
import { IPlan } from '@app/queries/types';

export interface IFilterControlProps {
  category: FilterCategory<IPlan>;
  filterValue: FilterValue;
  setFilterValue: (newValue: FilterValue) => void;
  showToolbarItem: boolean;
}

export const FilterControl: React.FunctionComponent<IFilterControlProps> = ({
  category,
  ...props
}: IFilterControlProps) => {
  if (category.type === FilterType.select) {
    return <SelectFilterControl category={category as ISelectFilterCategory<IPlan>} {...props} />;
  }
  if (category.type === FilterType.search) {
    return <SearchFilterControl category={category as ISearchFilterCategory<IPlan>} {...props} />;
  }
  return null;
};
