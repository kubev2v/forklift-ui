import React from 'react';
import { Tooltip } from '@patternfly/react-core';

export interface IAddTooltipProps {
  isEnabled: boolean;
  content: string;
  children: React.ReactElement;
}

// TODO: lib-ui candidate
const AddTooltip: React.FunctionComponent<IAddTooltipProps> = ({
  isEnabled,
  children,
  ...props
}: IAddTooltipProps) => (isEnabled ? <Tooltip {...props}>{children}</Tooltip> : children);

export default AddTooltip;
