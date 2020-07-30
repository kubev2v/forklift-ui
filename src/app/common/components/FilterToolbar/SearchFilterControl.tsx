import * as React from 'react';
import {
  ToolbarFilter,
  InputGroup,
  TextInput,
  Button,
  ButtonVariant,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { IFilterControlProps } from './FilterControl';
import { ISearchFilterCategory } from './FilterToolbar';

export interface ISearchFilterControlProps extends IFilterControlProps {
  category: ISearchFilterCategory;
}

const SearchFilterControl: React.FunctionComponent<ISearchFilterControlProps> = ({
  category,
  filterValue,
  setFilterValue,
  showToolbarItem,
}: ISearchFilterControlProps) => {
  // Keep internal copy of value until submitted by user
  const [inputValue, setInputValue] = React.useState((filterValue && filterValue[0]) || '');
  // Update it if it changes externally
  React.useEffect(() => {
    setInputValue((filterValue && filterValue[0]) || '');
  }, [filterValue]);

  const onFilterSubmit = () => setFilterValue(inputValue ? [inputValue] : []);

  const id = `${category.key}-input`;
  return (
    <ToolbarFilter
      chips={filterValue || []}
      deleteChip={() => setFilterValue([])}
      categoryName={category.title}
      showToolbarItem={showToolbarItem}
    >
      <InputGroup>
        <TextInput
          name={id}
          id={id}
          type="search"
          aria-label={`${category.title} filter`}
          onChange={setInputValue}
          value={inputValue}
          placeholder={category.placeholderText}
          onKeyDown={(event: React.KeyboardEvent) => {
            if (event.key && event.key !== 'Enter') return;
            onFilterSubmit();
          }}
        />
        <Button
          variant={ButtonVariant.control}
          aria-label="search button for search input"
          onClick={onFilterSubmit}
        >
          <SearchIcon />
        </Button>
      </InputGroup>
    </ToolbarFilter>
  );
};

export default SearchFilterControl;
