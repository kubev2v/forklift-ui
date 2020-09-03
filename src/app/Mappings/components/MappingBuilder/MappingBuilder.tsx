import * as React from 'react';
import { Button, TextContent, Text, Grid, GridItem, Flex } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';
import { MappingType, MappingSource, MappingTarget } from '../../types';
import { ICNVNetwork } from '@app/Providers/types';
import LineArrow from '@app/common/components/LineArrow/LineArrow';
import MappingSourceSelect from './MappingSourceSelect';
import MappingTargetSelect from './MappingTargetSelect';
import './MappingBuilder.css';

export interface IMappingBuilderGroup {
  sources: MappingSource[];
  target: MappingTarget | null;
}

interface IMappingBuilderProps {
  mappingType: MappingType;
  availableSources: MappingSource[];
  availableTargets: MappingTarget[];
  mappingGroups: IMappingBuilderGroup[];
  setMappingGroups: (groups: IMappingBuilderGroup[]) => void;
}

export const MappingBuilder: React.FunctionComponent<IMappingBuilderProps> = ({
  mappingType,
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
  if (mappingType === MappingType.Network) {
    instructionText = 'Select one or more source networks for each target network.';
    sourceHeadingText = 'Source networks';
    targetHeadingText = 'Target networks';
    selectSourcePlaceholder = 'Select source...';
    selectTargetPlaceholder = 'Select target...';
  }
  if (mappingType === MappingType.Storage) {
    instructionText = 'Select one or more source datastores for each target storage class.';
    sourceHeadingText = 'Source datastores';
    targetHeadingText = 'Target storage classes';
    selectSourcePlaceholder = 'Select source...';
    selectTargetPlaceholder = 'Select target...';
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
          const t = group.target as string | null;
          key = t ? t : `empty-${groupIndex}`;
        }
        return (
          <Grid key={key}>
            {groupIndex === 0 ? (
              <>
                <GridItem span={5} className={spacing.pbSm}>
                  <label className="pf-c-form__label">
                    <span className="pf-c-form__label-text">{sourceHeadingText}</span>
                  </label>
                </GridItem>
                <GridItem span={1} />
                <GridItem span={5} className={spacing.pbSm}>
                  <label className="pf-c-form__label">
                    <span className="pf-c-form__label-text">{targetHeadingText}</span>
                  </label>
                </GridItem>
                <GridItem span={1} />
              </>
            ) : null}
            <GridItem span={5}>
              <div className={`mapping-viewer-box ${spacing.pSm}`}>
                <MappingSourceSelect
                  id={`mapping-sources-for-${key}`}
                  mappingGroups={mappingGroups}
                  groupIndex={groupIndex}
                  setMappingGroups={setMappingGroups}
                  availableSources={availableSources}
                  placeholderText={selectSourcePlaceholder}
                />
              </div>
            </GridItem>
            <GridItem span={1} style={{ paddingTop: 18 }}>
              <LineArrow />
            </GridItem>
            <GridItem span={5}>
              <div className={`mapping-viewer-box ${spacing.pSm}`}>
                <MappingTargetSelect
                  id={`mapping-target-for-${key}`}
                  mappingType={mappingType}
                  mappingGroups={mappingGroups}
                  groupIndex={groupIndex}
                  setMappingGroups={setMappingGroups}
                  availableTargets={availableTargets}
                  placeholderText={selectTargetPlaceholder}
                />
              </div>
            </GridItem>
            <GridItem span={1} className={`${spacing.ptSm} ${alignment.textAlignCenter}`}>
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
        <Button variant="secondary" icon={<PlusCircleIcon />} onClick={addEmptyGroup}>
          Add
        </Button>
        <Button variant="secondary" onClick={resetGroups} isDisabled={isReset}>
          Remove all
        </Button>
      </Flex>
    </>
  );
};
