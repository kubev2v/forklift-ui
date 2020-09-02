import * as React from 'react';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';
import { MappingType, MappingSource, MappingTarget } from '../../types';
import { ICNVNetwork, IVMwareProvider, ICNVProvider, ICNVStorageClass } from '@app/Providers/types';
import { Button, TextContent, Text, Grid, GridItem, Title } from '@patternfly/react-core';
import LineArrow from '@app/common/components/LineArrow/LineArrow';
import MappingSourceSelect from './MappingSourceSelect';
import MappingTargetSelect from './MappingTargetSelect';
import './MappingBuilder.css';

interface IMappingBuilderProps {
  mappingType: MappingType;
  sourceProvider: IVMwareProvider;
  targetProvider: ICNVProvider;
  availableSources: MappingSource[];
  availableTargets: MappingTarget[];
}

export interface IMappingBuilderGroup {
  sources: MappingSource[];
  target: MappingTarget | null;
}

const MappingBuilder: React.FunctionComponent<IMappingBuilderProps> = ({
  mappingType,
  sourceProvider,
  targetProvider,
  availableSources,
  availableTargets,
}: IMappingBuilderProps) => {
  // TODO have helpers to unflatten from initialMappingItems (for editing)
  // and to flatten into mappingItems (for saving)

  const emptyGroup: IMappingBuilderGroup = { sources: [], target: null };
  const [mappingGroups, setMappingGroups] = React.useState<IMappingBuilderGroup[]>([
    { ...emptyGroup },
  ]);

  const addEmptyGroup = () => setMappingGroups([...mappingGroups, { ...emptyGroup }]);
  const removeGroup = (groupIndex: number) => {
    setMappingGroups(mappingGroups.filter((_group, index) => index !== groupIndex));
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
                <GridItem span={2} />
                <GridItem span={5} className={spacing.pbMd}>
                  <Title headingLevel="h2" size="md">
                    {targetHeadingText}
                  </Title>
                </GridItem>
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
            <GridItem span={2} className={spacing.ptMd}>
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
          </Grid>
        );
      })}
      <div className={alignment.textAlignCenter}>
        <Button onClick={addEmptyGroup}>{addButtonText}</Button>
      </div>
    </>
  );
};

export default MappingBuilder;
