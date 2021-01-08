import * as React from 'react';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import {
  IAnnotatedStorageClass,
  IOpenShiftNetwork,
  MappingTarget,
  MappingType,
  POD_NETWORK,
} from '@app/queries/types';
import { IMappingBuilderItem } from './MappingBuilder';
import { getMappingTargetName } from '../MappingDetailView/helpers';
import TruncatedText from '@app/common/components/TruncatedText';
import ConditionalTooltip from '@app/common/components/ConditionalTooltip';

interface IMappingTargetSelectProps {
  id: string;
  builderItems: IMappingBuilderItem[];
  itemIndex: number;
  setBuilderItems: (items: IMappingBuilderItem[]) => void;
  availableTargets: MappingTarget[];
  mappingType: MappingType;
}

const MappingTargetSelect: React.FunctionComponent<IMappingTargetSelectProps> = ({
  id,
  builderItems,
  itemIndex,
  setBuilderItems,
  availableTargets,
  mappingType,
}: IMappingTargetSelectProps) => {
  const setTarget = React.useCallback(
    (target: MappingTarget) => {
      const newItems = [...builderItems];
      newItems[itemIndex] = { ...builderItems[itemIndex], target, highlight: false };
      setBuilderItems(newItems);
    },
    [builderItems, itemIndex, setBuilderItems]
  );

  React.useEffect(() => {
    if (!builderItems[itemIndex].target) {
      let defaultTarget: MappingTarget | null = null;
      if (mappingType === MappingType.Network) {
        defaultTarget = POD_NETWORK;
      } else if (mappingType === MappingType.Storage) {
        defaultTarget =
          availableTargets.find((target) => (target as IAnnotatedStorageClass).uiMeta.isDefault) ||
          null;
      }
      if (defaultTarget) {
        setTarget(defaultTarget);
      }
    }
  }, [availableTargets, builderItems, itemIndex, mappingType, setTarget]);

  const targetOptions: OptionWithValue<MappingTarget>[] = availableTargets.map((target) => {
    let name = getMappingTargetName(target, mappingType);
    let isCompatible = true;
    let isDefault = false;
    if (mappingType === MappingType.Storage) {
      const targetStorage = target as IAnnotatedStorageClass;
      isCompatible = targetStorage.uiMeta.isCompatible;
      if (targetStorage.uiMeta.isDefault) {
        isDefault = true;
      }
    } else if (mappingType === MappingType.Network) {
      const targetNetwork = target as IOpenShiftNetwork;
      isDefault = targetNetwork.type === 'pod';
    }
    if (isDefault) {
      name = `${name} (default)`;
    }
    return {
      value: target,
      toString: () => name,
      props: {
        isDisabled: !isCompatible,
        className: !isCompatible ? 'disabled-with-pointer-events' : '',
        children: (
          <ConditionalTooltip
            isTooltipEnabled={!isCompatible}
            content="This storage class cannot be selected because it is not compatible with kubevirt."
            position="left"
          >
            <div>
              <TruncatedText>{name}</TruncatedText>
            </div>
          </ConditionalTooltip>
        ),
      },
    };
  });

  const selectedOption = targetOptions.find(
    (option: OptionWithValue<MappingTarget>) =>
      option.value.selfLink === builderItems[itemIndex].target?.selfLink
  );

  return (
    <SimpleSelect
      id={id}
      aria-label="Select target"
      className="mapping-item-select"
      variant="typeahead"
      isPlain
      options={targetOptions}
      value={[selectedOption]}
      onChange={(selection) => {
        setTarget((selection as OptionWithValue<MappingTarget>).value);
      }}
      typeAheadAriaLabel="Select target..."
      placeholderText="Select target..."
    />
  );
};

export default MappingTargetSelect;
