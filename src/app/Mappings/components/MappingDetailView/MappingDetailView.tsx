import * as React from 'react';
import { Grid, GridItem, Text } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import text from '@patternfly/react-styles/css/utilities/Text/text';

import { Mapping, MappingType } from '@app/queries/types';
import LineArrow from '@app/common/components/LineArrow';
import { useResourceQueriesForMapping } from '@app/queries';
import TruncatedText from '@app/common/components/TruncatedText';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { getMappingSourceById, getMappingSourceTitle, getMappingTargetTitle } from '../helpers';
import { getMappingItemTargetName, groupMappingItemsByTarget } from './helpers';

import './MappingDetailView.css';
import { ProviderType } from '@app/common/constants';

interface IMappingDetailViewProps {
  mappingType: MappingType;
  sourceProviderType: ProviderType;
  mapping: Mapping | null;
  className?: string;
}

const MappingDetailView: React.FunctionComponent<IMappingDetailViewProps> = ({
  mappingType,
  sourceProviderType,
  mapping,
  className = '',
}: IMappingDetailViewProps) => {
  const mappingResourceQueries = useResourceQueriesForMapping(mappingType, mapping);
  const mappingItemGroups = groupMappingItemsByTarget(
    mapping?.spec.map || [],
    mappingType,
    mappingResourceQueries.availableTargets
  );

  return (
    <ResolvedQueries
      results={mappingResourceQueries.queries}
      errorTitles={[
        'Cannot load providers',
        'Cannot load source provider resources',
        'Cannot load target provider resources',
      ]}
      className={className}
    >
      <div className={className}>
        <Grid>
          <GridItem span={5} className={spacing.pbSm}>
            <Text className={text.fontWeightBold}>
              {getMappingSourceTitle(mappingType, sourceProviderType)}
            </Text>
          </GridItem>
          <GridItem span={2}></GridItem>
          <GridItem span={5} className={spacing.pbSm}>
            <Text className={text.fontWeightBold}>{getMappingTargetTitle(mappingType)}</Text>
          </GridItem>
        </Grid>
        {mappingItemGroups.map((items, index) => {
          const targetName = getMappingItemTargetName(
            items[0],
            mappingType,
            mappingResourceQueries.availableTargets
          );
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
                    return (
                      <li key={sourceName}>
                        <TruncatedText>
                          {sourceName || <span className="missing-item">Not available</span>}
                        </TruncatedText>
                      </li>
                    );
                  })}
                </ul>
              </GridItem>
              <GridItem span={2} className="mapping-view-arrow-cell">
                <LineArrow />
              </GridItem>
              <GridItem span={5} className={`mapping-view-box ${spacing.pSm}`}>
                <TruncatedText>
                  {targetName || <span className="missing-item">Not available</span>}
                </TruncatedText>
              </GridItem>
            </Grid>
          );
        })}
      </div>
    </ResolvedQueries>
  );
};

export default MappingDetailView;
