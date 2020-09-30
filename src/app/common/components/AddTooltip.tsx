import React from 'react';
import { Tooltip } from '@patternfly/react-core';
import { TooltipProps } from '@patternfly/react-core/dist/js/components/Tooltip/Tooltip';

export interface IAddTooltipProps extends TooltipProps {
  isTooltipEnabled: boolean;
  children: React.ReactElement;
}

// TODO: lib-ui candidate
const AddTooltip: React.FunctionComponent<IAddTooltipProps> = ({
  isTooltipEnabled,
  children,
  ...props
}: IAddTooltipProps) => (isTooltipEnabled ? <Tooltip {...props}>{children}</Tooltip> : children);

export default AddTooltip;
