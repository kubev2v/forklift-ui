import * as React from 'react';
import { INetworkMappingItem, IStorageMappingItem, MappingItemTarget } from '../../types';
import { IVMwareNetwork, IVMwareProvider, IVMwareDatastore } from '@app/Providers/types';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';

interface IMappingSourceSelectProps {
  id: string;
  sourceProvider: IVMwareProvider;
  mappingItems: (INetworkMappingItem | IStorageMappingItem)[];
  availableSources: (IVMwareNetwork | IVMwareDatastore)[];
  target: MappingItemTarget;
  addMappingItem: (item: INetworkMappingItem | IStorageMappingItem) => void;
  removeMappingItem: (item: INetworkMappingItem | IStorageMappingItem) => void;
  removeMappingTarget: (target: MappingItemTarget) => void;
  placeholderText: string;
}

const MappingSourceSelect: React.FunctionComponent<IMappingSourceSelectProps> = ({
  id,
  sourceProvider,
  mappingItems,
  availableSources,
  target,
  addMappingItem,
  removeMappingItem,
  removeMappingTarget,
  placeholderText,
}: IMappingSourceSelectProps) => {
  // Don't allow selection of sources already selected for other targets
  const filteredSources = availableSources.filter(
    (source) => !mappingItems.some((item) => item.src.id === source.id && item.target !== target)
  );
  const options: OptionWithValue<IVMwareNetwork | IVMwareDatastore>[] = filteredSources.map(
    (source) => ({
      value: source,
      toString: () => `${sourceProvider.metadata.name} / ${source.name}`,
    })
  );
  const selectedOptions = options.filter((option) =>
    mappingItems.some((item) => item.src.id === option.value.id)
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
        const option = selection as OptionWithValue<IVMwareNetwork | IVMwareDatastore>;
        const selecting = !selectedOptions.includes(option);
        if (selecting) {
          addMappingItem({
            src: { id: option.value.id },
            target,
          } as INetworkMappingItem | IStorageMappingItem);
          // TODO should we look for null-source placeholders to remove?
        } else {
          const itemToRemove = mappingItems.find(
            (item) => item.src.id === option.value.id && item.target === target
          );
          if (itemToRemove) {
            removeMappingItem(itemToRemove);
          }
          if (selectedOptions.length === 1) {
            // TODO we're removing the last option for this target, do we want to leave a null-source placeholder?
            // Maybe do this within removeMappingItem / addMappingItem up one level
          }
        }
      }}
      onClear={() => removeMappingTarget(target)}
      typeAheadAriaLabel={placeholderText}
      placeholderText={placeholderText}
    />
  );
};

export default MappingSourceSelect;
