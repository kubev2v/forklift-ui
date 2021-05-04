import * as React from 'react';
import {
  Flex,
  FlexItem,
  EmptyState,
  EmptyStateIcon,
  EmptyStateIconProps,
  Title,
  EmptyStateBody,
  Button,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

export interface ITableEmptyStateProps {
  icon?: EmptyStateIconProps['icon'];
  titleText?: string;
  bodyText?: string;
  onClearFiltersClick?: () => void;
  isHiddenActions?: boolean;
}

const TableEmptyState: React.FunctionComponent<ITableEmptyStateProps> = ({
  icon = SearchIcon,
  titleText,
  bodyText,
  onClearFiltersClick,
  isHiddenActions = false,
}: ITableEmptyStateProps) => (
  <Flex justifyContent={{ default: 'justifyContentCenter' }}>
    <FlexItem>
      <EmptyState variant="small">
        <EmptyStateIcon icon={icon} />
        {titleText ? (
          <Title headingLevel="h5" size="lg">
            {titleText}
          </Title>
        ) : null}
        {bodyText ? (
          <EmptyStateBody className={!titleText ? spacing.mt_0 : ''}>{bodyText}</EmptyStateBody>
        ) : null}
        {onClearFiltersClick && !isHiddenActions && (
          <Button variant="link" onClick={onClearFiltersClick}>
            Clear all filters
          </Button>
        )}
      </EmptyState>
    </FlexItem>
  </Flex>
);

export default TableEmptyState;
