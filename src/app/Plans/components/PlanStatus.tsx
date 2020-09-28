import * as React from 'react';
import { Progress, ProgressVariant, ProgressMeasureLocation } from '@patternfly/react-core';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';

import { PlanStatusType } from '@app/common/constants';

interface IPlanStatusProps {
  isReady: boolean;
  title?: string;
  value?: number;
  message?: string;
  variant?: ProgressVariant | undefined;
}

const PlanStatus: React.FunctionComponent<IPlanStatusProps> = ({
  isReady = false,
  title,
  value,
  message,
  variant,
}: IPlanStatusProps) => {
  return isReady ? (
    <StatusIcon status={StatusType.Ok} label={PlanStatusType.ready} />
  ) : (
    <Progress
      title={title}
      value={value}
      label={message}
      valueText={message}
      variant={variant}
      measureLocation={ProgressMeasureLocation.top}
    />
  );
};

export default PlanStatus;
