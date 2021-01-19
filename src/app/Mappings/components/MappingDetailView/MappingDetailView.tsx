import * as React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Mapping, MappingType } from '@app/queries/types';
import LineArrow from '@app/common/components/LineArrow';
import { useResourceQueriesForMapping } from '@app/queries';
import TruncatedText from '@app/common/components/TruncatedText';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { getMappingSourceById, getMappingSourceTitle, getMappingTargetTitle } from '../helpers';
import { getMappingItemTargetName, groupMappingItemsByTarget } from './helpers';

import './MappingDetailView.css';

interface IMappingDetailViewProps {
  mappingType: MappingType;
  mapping: Mapping | null;
  className?: string;
}

const MappingDetailView: React.FunctionComponent<IMappingDetailViewProps> = ({
  mappingType,
  mapping,
  className = '',
}: IMappingDetailViewProps) => {
  const mappingResourceQueries = useResourceQueriesForMapping(mappingType, mapping);
  const mappingItemGroups = groupMappingItemsByTarget(mapping?.spec.map || [], mappingType);

  return (
    <ResolvedQueries
      results={mappingResourceQueries.queries}
      errorTitles={[
        'Error loading providers',
        'Error loading source provider resources',
        'Error loading target provider resources',
      ]}
      className={className}
    >
      <div className={className}>
        <Grid>
          <GridItem span={5} className={spacing.pbSm}>
            <label className="pf-c-form__label">
              <span className="pf-c-form__label-text">{getMappingSourceTitle(mappingType)}</span>
            </label>
          </GridItem>
          <GridItem span={2}></GridItem>
          <GridItem span={5} className={spacing.pbSm}>
            <label className="pf-c-form__label">
              <span className="pf-c-form__label-text">{getMappingTargetTitle(mappingType)}</span>
            </label>
          </GridItem>
        </Grid>
        {mappingItemGroups.map((items, index) => {
          const targetName = getMappingItemTargetName(items[0], mappingType);
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
                        <TruncatedText>{sourceName}</TruncatedText>
                      </li>
                    );
                  })}
                </ul>
              </GridItem>
              <GridItem span={2} className="mapping-view-arrow-cell">
                <LineArrow />
              </GridItem>
              <GridItem span={5} className={`mapping-view-box ${spacing.pSm}`}>
                <TruncatedText>{targetName}</TruncatedText>
              </GridItem>
            </Grid>
          );
        })}
      </div>
    </ResolvedQueries>
  );
};

export default MappingDetailView;
