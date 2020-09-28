import * as React from 'react';
import { Progress, ProgressVariant, ProgressMeasureLocation } from '@patternfly/react-core';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';

import { PlanStatusType } from '@app/common/constants';

interface IPlanStatusProps {
  status: string;
  value?: number;
  message?: string;
}

const PlanStatus: React.FunctionComponent<IPlanStatusProps> = ({
  status,
  value,
  message,
}: IPlanStatusProps) => {
  let isReady = false;
  let variant: ProgressVariant | undefined;
  let title: PlanStatusType | undefined;

  switch (status) {
    case PlanStatusType.ready:
      isReady = true;
      break;
    case PlanStatusType.running:
      title = PlanStatusType.running;
      break;
    case PlanStatusType.finished:
      variant = ProgressVariant.success;
      title = PlanStatusType.finished;
      break;
    case PlanStatusType.error:
      variant = ProgressVariant.danger;
      title = PlanStatusType.error;
      break;
  }

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
