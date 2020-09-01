import * as React from 'react';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';
import {
  MappingType,
  INetworkMappingItem,
  IStorageMappingItem,
  MappingItemTarget,
} from '../../types';
import {
  IVMwareNetwork,
  IVMwareDatastore,
  ICNVNetwork,
  IVMwareProvider,
  ICNVProvider,
  ICNVStorageClass,
} from '@app/Providers/types';
import { Button, TextContent, Text, Grid, GridItem, Title } from '@patternfly/react-core';
import LineArrow from '@app/common/components/LineArrow/LineArrow';

import './MappingBuilder.css';
import { getMappingTargets } from './helpers';
import MappingSourceSelect from './MappingSourceSelect';
import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';

interface IMappingBuilderProps {
  mappingType: MappingType;
  sourceProvider: IVMwareProvider;
  targetProvider: ICNVProvider;
  availableSources: (IVMwareNetwork | IVMwareDatastore)[];
  availableTargets: (ICNVNetwork | ICNVStorageClass)[];
}

const MappingBuilder: React.FunctionComponent<IMappingBuilderProps> = ({
  mappingType,
  sourceProvider,
  targetProvider,
  availableSources,
  availableTargets,
}: IMappingBuilderProps) => {
  console.log({ mappingType, sourceProvider, targetProvider, availableSources, availableTargets });
  const [mappingItems, setMappingItems] = React.useState<
    (INetworkMappingItem | IStorageMappingItem)[]
  >([]);
  const [isEmptyGroupShown, setIsEmptyGroupShown] = React.useState<boolean>(true);
  // TODO how to deal with the fact that if we have more than one null target, the sources get duplicated?

  const updateMappingItems = (items: (INetworkMappingItem | IStorageMappingItem)[]) => {
    setMappingItems(items);
    if (items.length === 0) {
      setIsEmptyGroupShown(true);
    }
  };

  const addMappingItem = (item: INetworkMappingItem | IStorageMappingItem) => {
    updateMappingItems([...mappingItems, item]);
    setIsEmptyGroupShown(false);
  };
  const removeMappingItem = (item: INetworkMappingItem | IStorageMappingItem) => {
    updateMappingItems(mappingItems.filter((i) => i !== item));
  };
  const removeMappingTarget = (target: MappingItemTarget) => {
    updateMappingItems(mappingItems.filter((i) => i.target !== target));
  };
  const updateMappingTarget = (oldTarget: MappingItemTarget, newTarget: MappingItemTarget) => {
    updateMappingItems(
      mappingItems.map((item) => {
        if (item.target === oldTarget) {
          return { ...item, target: newTarget } as INetworkMappingItem | IStorageMappingItem;
        }
        return item;
      })
    );
  };

  let instructionText = '';
  let sourceHeadingText = '';
  let targetHeadingText = '';
  let selectSourcePlaceholder = '';
  let selectTargetPlaceholder = '';
  let addButtonText = '';
  if (mappingType === MappingType.Network) {
    instructionText = 'Select one or more source networks for each target network.';
    sourceHeadingText = 'Provider / Network';
    targetHeadingText = 'Provider / Network';
    selectSourcePlaceholder = 'Select source network(s)...';
    selectTargetPlaceholder = 'Select target network...';
    addButtonText = 'Add target network';
  }
  if (mappingType === MappingType.Storage) {
    instructionText = 'Select one or more source datastores for each target storage class.';
    sourceHeadingText = 'Provider / Datastore';
    targetHeadingText = 'Provider / Storage class';
    selectSourcePlaceholder = 'Select source datastore(s)...';
    selectTargetPlaceholder = 'Select target storage class...';
    addButtonText = 'Add target storage class';
  }

  const mappingTargets = [
    ...getMappingTargets(mappingType, mappingItems),
    ...(isEmptyGroupShown ? [null] : []),
  ];

  return (
    <>
      <TextContent>
        <Text component="p">{instructionText}</Text>
      </TextContent>
      {mappingTargets.map((target, targetIndex) => {
        let key = '';
        if (mappingType === MappingType.Network) {
          const t = target as ICNVNetwork | null;
          key = t ? `${t.namespace}-${t.name}` : 'empty';
        }
        if (mappingType === MappingType.Storage) {
          const t = target as ICNVStorageClass | null;
          key = t ? t.storageClass : 'empty';
        }

        // Don't allow selection of targets already selected
        const filteredTargets = availableTargets.filter(
          (t) => !mappingItems.some((item) => item.target !== target && item.target === t)
        );
        const targetOptions: OptionWithValue<
          ICNVNetwork | ICNVStorageClass
        >[] = filteredTargets.map((target) => ({
          value: target,
          toString: () => {
            if (mappingType === MappingType.Network) {
              return `${targetProvider.metadata.name} / ${(target as ICNVNetwork).name}`;
            }
            if (mappingType === MappingType.Storage) {
              return (target as ICNVStorageClass).storageClass;
            }
            return '';
          },
        }));

        return (
          <Grid key={key}>
            {targetIndex === 0 ? (
              <>
                <GridItem span={5} className={spacing.pbMd}>
                  <Title headingLevel="h2" size="md">
                    {sourceHeadingText}
                  </Title>
                </GridItem>
                <GridItem span={2} />
                <GridItem span={5} className={spacing.pbMd}>
                  <Title headingLevel="h2" size="md">
                    {targetHeadingText}
                  </Title>
                </GridItem>
              </>
            ) : null}
            <GridItem span={5} className={`mapping-viewer-box ${spacing.pMd}`}>
              <MappingSourceSelect
                id={`mapping-sources-for-${key}`}
                sourceProvider={sourceProvider}
                mappingItems={mappingItems}
                availableSources={availableSources}
                target={target}
                addMappingItem={addMappingItem}
                removeMappingItem={removeMappingItem}
                removeMappingTarget={removeMappingTarget}
                placeholderText={selectSourcePlaceholder}
              />
            </GridItem>
            <GridItem span={2} className={spacing.ptMd}>
              <LineArrow />
            </GridItem>
            <GridItem span={5} className={`mapping-viewer-box ${spacing.pMd}`}>
              <SimpleSelect
                id={`mapping-target-for-${key}`}
                isPlain
                options={targetOptions}
                value={[
                  targetOptions.find(
                    (option: OptionWithValue<ICNVNetwork | ICNVStorageClass>) =>
                      option.value === target
                  ),
                ]}
                onChange={(selection) => {
                  updateMappingTarget(
                    target,
                    (selection as OptionWithValue<ICNVNetwork | ICNVStorageClass>).value
                  );
                }}
                placeholderText={selectTargetPlaceholder}
              />
            </GridItem>
          </Grid>
        );
      })}
      <div className={alignment.textAlignCenter}>
        <Button onClick={() => setIsEmptyGroupShown(true)} isDisabled={isEmptyGroupShown}>
          {addButtonText}
        </Button>
      </div>
    </>
  );
};

export default MappingBuilder;
