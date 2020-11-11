import * as React from 'react';
import { MappingSource } from '@app/queries/types';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { IMappingBuilderItem } from './MappingBuilder';
import TruncatedText from '@app/common/components/TruncatedText';

interface IMappingSourceSelectProps {
  id: string;
  builderItems: IMappingBuilderItem[];
  itemIndex: number;
  setBuilderItems: (items: IMappingBuilderItem[]) => void;
  availableSources: MappingSource[];
}

const MappingSourceSelect: React.FunctionComponent<IMappingSourceSelectProps> = ({
  id,
  builderItems,
  itemIndex,
  setBuilderItems,
  availableSources,
}: IMappingSourceSelectProps) => {
  const setSource = (source: MappingSource) => {
    const newItems = [...builderItems];
    newItems[itemIndex] = { ...builderItems[itemIndex], source };
    setBuilderItems(newItems);
  };

  // Don't allow selection of sources already selected in other groups
  const filteredSources = availableSources.filter(
    (source) =>
      !builderItems.some(
        (item, index) => item.source?.selfLink === source.selfLink && index !== itemIndex
      )
  );
  const options: OptionWithValue<MappingSource>[] = filteredSources.map((source) => ({
    value: source,
    toString: () => source.name,
    props: {
      children: <TruncatedText>{source.name}</TruncatedText>,
    },
  }));
  const selectedOption = options.filter(
    (option) => option.value.selfLink === builderItems[itemIndex].source?.selfLink
  );

  return (
    <SimpleSelect
      id={id}
      aria-label="Select source"
      className="mapping-item-select"
      variant="typeahead"
      isPlain
      options={options}
      value={[selectedOption]}
      onChange={(selection) => {
        setSource((selection as OptionWithValue<MappingSource>).value);
      }}
      typeAheadAriaLabel="Select source..."
      placeholderText="Select source..."
    />
  );
};

export default MappingSourceSelect;
