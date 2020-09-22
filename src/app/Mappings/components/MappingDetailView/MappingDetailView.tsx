import * as React from 'react';
import { Alert, Grid, GridItem, Title } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Mapping, MappingType } from '@app/queries/types';
import LineArrow from '@app/common/components/LineArrow';
import { getMappingSourceById, getMappingSourceTitle, getMappingTargetTitle } from '../helpers';
import { groupMappingItemsByTarget } from './helpers';

import './MappingDetailView.css';
import { useMappingResourceQueries } from '@app/queries';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';

interface IMappingDetailViewProps {
  mappingType: MappingType;
  mapping: Mapping;
  className: string;
}

const MappingDetailView: React.FunctionComponent<IMappingDetailViewProps> = ({
  mappingType,
  mapping,
  className,
}: IMappingDetailViewProps) => {
  const mappingResourceQueries = useMappingResourceQueries(
    mapping.provider.source,
    mapping.provider.target,
    mappingType
  );

  if (mappingResourceQueries.isLoading) {
    return <LoadingEmptyState className={className} />;
  }
  if (mappingResourceQueries.isError) {
    return <Alert className={className} variant="danger" title="Error loading mapping resources" />;
  }

  const mappingItemGroups = groupMappingItemsByTarget(mapping.items);
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
        const targetName = items[0].target.name;
        const isLastGroup = index === mappingItemGroups.length - 1;
        return (
          <Grid key={targetName} className={!isLastGroup ? spacing.mbLg : ''}>
            <GridItem span={5} className={`mapping-view-box ${spacing.pSm}`}>
              <ul>
                {items.map((item) => {
                  const source = getMappingSourceById(
                    mappingResourceQueries.availableSources,
                    item.source.id
                  );
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
