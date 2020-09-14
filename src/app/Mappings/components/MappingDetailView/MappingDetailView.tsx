import * as React from 'react';
import { Grid, GridItem, Title } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Mapping, MappingSource, MappingType } from '@app/Mappings/types';
import LineArrow from '@app/common/components/LineArrow';
import {
  getMappingSourceById,
  getMappingSourceTitle,
  getMappingTargetName,
  getMappingTargetTitle,
} from '../helpers';
import { groupMappingItemsByTarget } from './helpers';

import './MappingDetailView.css';

interface IMappingDetailViewProps {
  mappingType: MappingType;
  mapping: Mapping;
  availableSources: MappingSource[];
  className: string;
}

const MappingDetailView: React.FunctionComponent<IMappingDetailViewProps> = ({
  mappingType,
  mapping,
  availableSources,
  className,
}: IMappingDetailViewProps) => {
  const mappingItemGroups = groupMappingItemsByTarget(mapping.items, mappingType);
  return (
    <div className={className}>
      <Grid>
        <GridItem span={5} className={spacing.pbSm}>
          <Title size="md" headingLevel="h2">
            {getMappingSourceTitle(mappingType)}
          </Title>
        </GridItem>
        <GridItem span={2}></GridItem>
        <GridItem span={5} className={spacing.pbSm}>
          <Title size="md" headingLevel="h2">
            {getMappingTargetTitle(mappingType)}
          </Title>
        </GridItem>
      </Grid>
      {mappingItemGroups.map((items, index) => {
        const targetName = getMappingTargetName(items[0].target, mappingType);
        const isLastGroup = index === mappingItemGroups.length - 1;
        return (
          <Grid key={targetName} className={!isLastGroup ? spacing.mbLg : ''}>
            <GridItem span={5} className={`mapping-view-box ${spacing.pSm}`}>
              <ul>
                {items.map((item) => {
                  const source = getMappingSourceById(availableSources, item.source.id);
                  const sourceName = source ? source.name : '';
                  return <li key={sourceName}>{sourceName}</li>;
                })}
              </ul>
            </GridItem>
            <GridItem span={2} className="mapping-view-arrow-cell">
              <LineArrow />
            </GridItem>
            <GridItem span={5} className={`mapping-view-box ${spacing.pSm}`}>
              {targetName}
            </GridItem>
          </Grid>
        );
      })}
    </div>
  );
};

export default MappingDetailView;
