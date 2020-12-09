import * as React from 'react';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';
import { mostSeriousCondition } from '@app/common/helpers';
import { StatusCategoryType, PlanStatusType } from '@app/common/constants';
import { IStatusCondition } from '@app/queries/types';

interface IStatusConditionProps {
  status?: { conditions?: IStatusCondition[] };
  unknownFallback?: React.ReactNode;
}

const StatusCondition: React.FunctionComponent<IStatusConditionProps> = ({
  status = {},
  unknownFallback = null,
}: IStatusConditionProps) => {
  const conditions = status?.conditions || [];

  const getStatusType = () => {
    if (status) {
      if (mostSeriousCondition(conditions) === PlanStatusType.Ready) {
        return StatusType.Ok;
      } else if (
        mostSeriousCondition(conditions) === StatusCategoryType.Critical ||
        mostSeriousCondition(conditions) === StatusCategoryType.Error
      ) {
        return StatusType.Error;
      }
    }
    return StatusType.Warning;
  };

  if (status) {
    const conditions = status?.conditions || [];
    const label = mostSeriousCondition(conditions);

    if (label === 'Unknown' && unknownFallback !== null) {
      return <>{unknownFallback}</>;
    }

    return <StatusIcon status={getStatusType()} label={label} />;
  }
  return null;
};

export default StatusCondition;
