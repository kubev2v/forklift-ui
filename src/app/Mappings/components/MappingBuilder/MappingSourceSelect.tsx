import * as React from 'react';
import { MappingSource } from '../../types';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { IMappingBuilderGroup } from './MappingBuilder';

interface IMappingSourceSelectProps {
  id: string;
  mappingGroups: IMappingBuilderGroup[];
  groupIndex: number;
  setMappingGroups: (groups: IMappingBuilderGroup[]) => void;
  availableSources: MappingSource[];
  placeholderText: string;
}

const MappingSourceSelect: React.FunctionComponent<IMappingSourceSelectProps> = ({
  id,
  mappingGroups,
  groupIndex,
  setMappingGroups,
  availableSources,
  placeholderText,
}: IMappingSourceSelectProps) => {
  const setSources = (sources: MappingSource[]) => {
    const newGroups = [...mappingGroups];
    newGroups[groupIndex] = { ...mappingGroups[groupIndex], sources };
    setMappingGroups(newGroups);
  };
  const addSource = (source: MappingSource) =>
    setSources([...mappingGroups[groupIndex].sources, source]);
  const removeSource = (source: MappingSource) =>
    setSources(mappingGroups[groupIndex].sources.filter((s) => s !== source));
  const clearSources = () => setSources([]);

  // Don't allow selection of sources already selected in other groups
  const filteredSources = availableSources.filter(
    (source) =>
      !mappingGroups.some((group, index) => group.sources.includes(source) && index !== groupIndex)
  );
  const options: OptionWithValue<MappingSource>[] = filteredSources.map((source) => ({
    value: source,
    toString: () => source.name,
  }));
  const selectedOptions = options.filter((option) =>
    mappingGroups[groupIndex].sources.includes(option.value)
  );

  return (
    <SimpleSelect
      id={id}
      className="mapping-source-select"
      variant="typeaheadmulti"
      isPlain
      options={options}
      value={selectedOptions}
      onChange={(selection) => {
        const option = selection as OptionWithValue<MappingSource>;
        if (!selectedOptions.includes(option)) {
          addSource(option.value);
        } else {
          removeSource(option.value);
        }
      }}
      onClear={clearSources}
      typeAheadAriaLabel={placeholderText}
      placeholderText={placeholderText}
    />
  );
};

export default MappingSourceSelect;
