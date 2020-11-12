import * as React from 'react';
import { Alert, Grid, GridItem } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Mapping, MappingType } from '@app/queries/types';
import LineArrow from '@app/common/components/LineArrow';
import { getMappingSourceById, getMappingSourceTitle, getMappingTargetTitle } from '../helpers';
import { getMappingItemTargetName, groupMappingItemsByTarget } from './helpers';

import './MappingDetailView.css';
import { findProvidersByRefs, useMappingResourceQueries, useProvidersQuery } from '@app/queries';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import TruncatedText from '@app/common/components/TruncatedText';

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
  const providersQuery = useProvidersQuery();
  const { sourceProvider, targetProvider } = findProvidersByRefs(
    mapping?.spec.provider || null,
    providersQuery
  );
  const mappingResourceQueries = useMappingResourceQueries(
    sourceProvider,
    targetProvider,
    mappingType
  );

  if (providersQuery.isLoading || mappingResourceQueries.isLoading) {
    return <LoadingEmptyState className={className} />;
  }
  if (providersQuery.isError || mappingResourceQueries.isError) {
    return (
      <Alert
        className={className}
        isInline
        variant="danger"
        title="Error loading mapping resources"
      />
    );
  }

  const mappingItemGroups = groupMappingItemsByTarget(mapping?.spec.map || [], mappingType);
  return (
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
  );
};

export default MappingDetailView;
