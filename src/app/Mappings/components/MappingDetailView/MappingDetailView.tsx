import * as React from 'react';
import { Grid, GridItem, TextContent, Text } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Mapping, MappingType } from '@app/Mappings/types';
import LineArrow from '@app/common/components/LineArrow';
import './MappingDetailView.css';

interface IMappingViewerProps {
  mappingType: MappingType;
  mapping: Mapping;
  className: string;
}

const MappingViewer: React.FunctionComponent<IMappingViewerProps> = ({
  mappingType,
  mapping,
  className,
}: IMappingViewerProps) => {
  return (
    <div className={className}>
      <Grid>
        <GridItem span={5} className={spacing.pbSm}>
          <TextContent>
            <Text component="h2" className="mapping-view-box-heading">
              TODO: source heading
            </Text>
          </TextContent>
        </GridItem>
        <GridItem span={2}></GridItem>
        <GridItem span={5} className={spacing.pbSm}>
          <TextContent>
            <Text component="h2" className="mapping-view-box-heading">
              TODO: target heading
            </Text>
          </TextContent>
        </GridItem>
      </Grid>
      <Grid>
        <GridItem span={5} className={`mapping-view-box ${spacing.pSm}`}>
          <ul>
            <li>TODO: source 1</li>
            <li>TODO: source 2</li>
            <li>TODO: source 3</li>
          </ul>
        </GridItem>
        <GridItem span={2} className="mapping-view-arrow-cell">
          <LineArrow />
        </GridItem>
        <GridItem span={5} className={`mapping-view-box ${spacing.pSm}`}>
          TODO: target name
        </GridItem>
      </Grid>
    </div>
  );
};

export default MappingViewer;
