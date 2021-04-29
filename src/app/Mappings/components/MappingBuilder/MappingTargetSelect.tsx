import * as React from 'react';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { StatusIcon } from '@konveyor/lib-ui';
import SimpleSelect, {
  ISimpleSelectProps,
  OptionWithValue,
} from '@app/common/components/SimpleSelect';
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

interface IMappingTargetSelectProps extends Partial<ISimpleSelectProps> {
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
  ...props
}: IMappingTargetSelectProps) => {
  const setTarget = React.useCallback(
    (target: MappingTarget) => {
      const newItems = [...builderItems];
      newItems[itemIndex] = { ...builderItems[itemIndex], target };
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
    let hasNoProvisionerWarning = false;
    let isDefault = false;
    if (mappingType === MappingType.Storage) {
      const targetStorage = target as IAnnotatedStorageClass;
      hasNoProvisionerWarning = !targetStorage.uiMeta.hasProvisioner;
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
        children: (
          <ConditionalTooltip
            isTooltipEnabled={hasNoProvisionerWarning}
            content={
              <>
                This storage does not support dynamic provisioning. The default settings, Filesystem
                volume mode and ReadWriteOnce access mode, will be used. Performance may be
                impacted. See product documentation for more information.
              </>
            }
            position="left"
          >
            <div>
              {hasNoProvisionerWarning ? (
                <>
                  <StatusIcon status="Warning" className={spacing.mrSm} />
                  <TruncatedText className="inline-option-text">{name}</TruncatedText>
                </>
              ) : (
                <TruncatedText>{name}</TruncatedText>
              )}
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
      {...props}
    />
  );
};

export default MappingTargetSelect;
