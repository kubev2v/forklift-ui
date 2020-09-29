import * as React from 'react';
import { MappingSource } from '@app/queries/types';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { IMappingBuilderItem } from './MappingBuilder';

interface IMappingSourceSelectProps {
  id: string;
  builderItems: IMappingBuilderItem[];
  itemIndex: number;
  setBuilderItems: (items: IMappingBuilderItem[]) => void;
  availableSources: MappingSource[];
  placeholderText: string;
  toggleAddMappingDisable: () => void;
}

const MappingSourceSelect: React.FunctionComponent<IMappingSourceSelectProps> = ({
  id,
  builderItems,
  itemIndex,
  setBuilderItems,
  availableSources,
  placeholderText,
  toggleAddMappingDisable,
}: IMappingSourceSelectProps) => {
  const setSource = (source: MappingSource) => {
    const newItems = [...builderItems];
    newItems[itemIndex] = { ...builderItems[itemIndex], source };
    setBuilderItems(newItems);
  };

  // Don't allow selection of sources already selected in other groups
  const filteredSources = availableSources.filter(
    (source) => !builderItems.some((item, index) => item.source === source && index !== itemIndex)
  );
  const options: OptionWithValue<MappingSource>[] = filteredSources.map((source) => ({
    value: source,
    toString: () => source.name,
  }));
  const selectedOption = options.filter(
    (option) => builderItems[itemIndex].source === option.value
  );

  return (
    <SimpleSelect
      id={id}
      className="mapping-item-select"
      variant="typeahead"
      isPlain
      options={options}
      value={[selectedOption]}
      onChange={(selection) => {
        console.log(filteredSources);
        if (filteredSources.length < 2) {
          console.log('toggle in select');
          toggleAddMappingDisable();
        }
        setSource((selection as OptionWithValue<MappingSource>).value);
      }}
      typeAheadAriaLabel={placeholderText}
      placeholderText={placeholderText}
    />
  );
};

export default MappingSourceSelect;
