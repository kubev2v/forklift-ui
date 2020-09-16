import React from 'react';
import { Tooltip } from '@patternfly/react-core';

export interface IAddTooltipProps {
  isTooltipEnabled: boolean;
  content: string;
  children: React.ReactElement;
}

// TODO: lib-ui candidate
const AddTooltip: React.FunctionComponent<IAddTooltipProps> = ({
  isTooltipEnabled,
  children,
  ...props
}: IAddTooltipProps) => (isTooltipEnabled ? <Tooltip {...props}>{children}</Tooltip> : children);

export default AddTooltip;
