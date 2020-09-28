import * as React from 'react';
import { Progress, ProgressVariant, ProgressMeasureLocation } from '@patternfly/react-core';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';

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
  let title = '';
  let variant: ProgressVariant | undefined;

  switch (status) {
    case 'Ready':
      title = 'Ready';
      isReady = true;
      break;
    case 'Error':
      title = 'Failed';
      variant = ProgressVariant.danger;
      break;
    case 'Finished':
      title = 'Complete';
      variant = ProgressVariant.success;
      break;
    default:
      title = 'Running';
      break;
  }

  return isReady ? (
    <StatusIcon status={StatusType.Ok} label="Ready" />
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
