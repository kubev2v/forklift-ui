import * as React from 'react';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';
import { getMostSeriousCondition } from '@app/common/helpers';
import { StatusCategoryType, PlanStatusType } from '@app/common/constants';
import { IStatusCondition } from '@app/queries/types';
import { Button, Popover } from '@patternfly/react-core';

interface IStatusConditionProps {
  status?: { conditions?: IStatusCondition[] };
  unknownFallback?: React.ReactNode;
}

const StatusCondition: React.FunctionComponent<IStatusConditionProps> = ({
  status = {},
  unknownFallback = null,
}: IStatusConditionProps) => {
  const getStatusType = (severity: string) => {
    if (status) {
      if (severity === PlanStatusType.Ready || severity === StatusCategoryType.Required) {
        return StatusType.Ok;
      }
      if (severity === StatusCategoryType.Advisory) {
        return StatusType.Info;
      }
      if (severity === StatusCategoryType.Critical || severity === StatusCategoryType.Error) {
        return StatusType.Error;
      }
    }
    return StatusType.Warning;
  };

  if (status) {
    const conditions = status?.conditions || [];
    const mostSeriousCondition = getMostSeriousCondition(conditions);

    if (mostSeriousCondition === 'Unknown' && unknownFallback !== null) {
      return <>{unknownFallback}</>;
    }

    const icon = (
      <StatusIcon status={getStatusType(mostSeriousCondition)} label={mostSeriousCondition} />
    );

    if (conditions.length === 0) return icon;

    return (
      <Popover
        bodyContent={
          <>
            {conditions.map((condition) => {
              const severity = getMostSeriousCondition([condition]);
              return (
                <StatusIcon
                  key={condition.message}
                  status={getStatusType(severity)}
                  label={condition.message}
                />
              );
            })}
          </>
        }
      >
        <Button variant="link" isInline>
          {icon}
        </Button>
      </Popover>
    );
  }
  return null;
};

export default StatusCondition;
