import React from 'react';
import { Tooltip, TooltipProps } from '@patternfly/react-core';

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
