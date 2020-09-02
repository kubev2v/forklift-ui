import * as React from 'react';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';
import { MappingType, MappingSource, MappingTarget } from '../../types';
import { ICNVNetwork, IVMwareProvider, ICNVProvider, ICNVStorageClass } from '@app/Providers/types';
import { Button, TextContent, Text, Grid, GridItem, Title, Flex } from '@patternfly/react-core';
import LineArrow from '@app/common/components/LineArrow/LineArrow';
import MappingSourceSelect from './MappingSourceSelect';
import MappingTargetSelect from './MappingTargetSelect';
import './MappingBuilder.css';
import { TrashIcon } from '@patternfly/react-icons';

export interface IMappingBuilderGroup {
  sources: MappingSource[];
  target: MappingTarget | null;
}

interface IMappingBuilderProps {
  mappingType: MappingType;
  sourceProvider: IVMwareProvider;
  targetProvider: ICNVProvider;
  availableSources: MappingSource[];
  availableTargets: MappingTarget[];
  mappingGroups: IMappingBuilderGroup[];
  setMappingGroups: (groups: IMappingBuilderGroup[]) => void;
}

export const MappingBuilder: React.FunctionComponent<IMappingBuilderProps> = ({
  mappingType,
  sourceProvider,
  targetProvider,
  availableSources,
  availableTargets,
  mappingGroups,
  setMappingGroups,
}: IMappingBuilderProps) => {
  const resetGroups = () => setMappingGroups([{ sources: [], target: null }]);
  const isReset =
    mappingGroups.length === 1 && mappingGroups[0].sources.length === 0 && !mappingGroups[0].target;
  const addEmptyGroup = () => setMappingGroups([...mappingGroups, { sources: [], target: null }]);
  const removeGroup = (groupIndex: number) => {
    if (mappingGroups.length > 1) {
      setMappingGroups(mappingGroups.filter((_group, index) => index !== groupIndex));
    } else {
      resetGroups();
    }
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

  return (
    <>
      <TextContent>
        <Text component="p">{instructionText}</Text>
      </TextContent>
      {mappingGroups.map((group, groupIndex) => {
        let key = '';
        if (mappingType === MappingType.Network) {
          const t = group.target as ICNVNetwork | null;
          key = t ? `${t.namespace}-${t.name}` : `empty-${groupIndex}`;
        }
        if (mappingType === MappingType.Storage) {
          const t = group.target as ICNVStorageClass | null;
          key = t ? t.storageClass : `empty-${groupIndex}`;
        }
        return (
          <Grid key={key}>
            {groupIndex === 0 ? (
              <>
                <GridItem span={5} className={spacing.pbMd}>
                  <Title headingLevel="h2" size="md">
                    {sourceHeadingText}
                  </Title>
                </GridItem>
                <GridItem span={1} />
                <GridItem span={5} className={spacing.pbMd}>
                  <Title headingLevel="h2" size="md">
                    {targetHeadingText}
                  </Title>
                </GridItem>
                <GridItem span={1} />
              </>
            ) : null}
            <GridItem span={5}>
              <div className={`mapping-viewer-box ${spacing.pMd}`}>
                <MappingSourceSelect
                  id={`mapping-sources-for-${key}`}
                  sourceProvider={sourceProvider}
                  mappingGroups={mappingGroups}
                  groupIndex={groupIndex}
                  setMappingGroups={setMappingGroups}
                  availableSources={availableSources}
                  placeholderText={selectSourcePlaceholder}
                />
              </div>
            </GridItem>
            <GridItem span={1} className={spacing.ptMd}>
              <LineArrow />
            </GridItem>
            <GridItem span={5}>
              <div className={`mapping-viewer-box ${spacing.pMd}`}>
                <MappingTargetSelect
                  id={`mapping-target-for-${key}`}
                  mappingType={mappingType}
                  targetProvider={targetProvider}
                  mappingGroups={mappingGroups}
                  groupIndex={groupIndex}
                  setMappingGroups={setMappingGroups}
                  availableTargets={availableTargets}
                  placeholderText={selectTargetPlaceholder}
                />
              </div>
            </GridItem>
            <GridItem span={1} className={`${spacing.ptMd} ${alignment.textAlignCenter}`}>
              <Button
                variant="plain"
                aria-label="Remove mapping"
                onClick={() => removeGroup(groupIndex)}
                isDisabled={isReset}
              >
                <TrashIcon />
              </Button>
            </GridItem>
          </Grid>
        );
      })}
      <Flex
        justifyContent={{ default: 'justifyContentCenter' }}
        spaceItems={{ default: 'spaceItemsMd' }}
      >
        <Button variant="secondary" onClick={addEmptyGroup}>
          {addButtonText}
        </Button>
        <Button variant="secondary" onClick={resetGroups} isDisabled={isReset}>
          Remove all
        </Button>
      </Flex>
    </>
  );
};
