import * as React from 'react';
import { IOvirtNetwork, MappingSource, SourceInventoryProvider } from '@app/queries/types';
import SimpleSelect, {
  ISimpleSelectProps,
  OptionWithValue,
} from '@app/common/components/SimpleSelect';
import { IMappingBuilderItem } from './MappingBuilder';
import TruncatedText from '@app/common/components/TruncatedText';
import { useDataCentersQuery } from '@app/queries';
import { IVSphereDc } from '@app/queries/types/datacenters.types';

interface IMappingSourceSelectProps extends Partial<ISimpleSelectProps> {
  sourceProvider: SourceInventoryProvider | null;
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
  sourceProvider,
  setBuilderItems,
  availableSources,
  ...props
}: IMappingSourceSelectProps) => {
  const { data: dataCenterMeta } = useDataCentersQuery(sourceProvider);
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

  const getDataCenterById = (id: string) => dataCenterMeta?.find((dc) => dc.id === id);

  const options: OptionWithValue<MappingSource>[] = filteredSources.map((source) => {
    const associatedDc = getDataCenterById((source as IOvirtNetwork).dataCenter);
    const associatedDir = (source as IVSphereDc).parent ? (source as IVSphereDc) : null;

    return {
      value: source,
      toString: () => source.name,
      props: {
        children: <TruncatedText>{source.name}</TruncatedText>,
        description:
          sourceProvider && sourceProvider?.type === 'ovirt'
            ? associatedDc
              ? `DC: ${associatedDc?.name}`
              : null
            : sourceProvider && sourceProvider?.type === 'vsphere'
            ? associatedDir
              ? `${associatedDir.parent.kind}: ${associatedDir.parent.id}`
              : null
            : null,
      },
    };
  });
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
      {...props}
    />
  );
};

export default MappingSourceSelect;
