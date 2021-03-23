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
  const getStatusType = (severity: string): StatusType => {
    if (status) {
      if (severity === PlanStatusType.Ready) {
        return 'Ok';
      }
      if (severity === StatusCategoryType.Advisory) {
        return 'Info';
      }
      if (severity === StatusCategoryType.Critical || severity === StatusCategoryType.Error) {
        return 'Error';
      }
    }
    return 'Warning';
  };

  if (status) {
    const conditions = status?.conditions || [];
    const mostSeriousCondition = getMostSeriousCondition(conditions);

    if (mostSeriousCondition === 'Unknown' && unknownFallback !== null) {
      return <>{unknownFallback}</>;
    }

    let label = mostSeriousCondition;
    if (mostSeriousCondition === StatusCategoryType.Required) {
      label = 'Not ready';
    }

    const icon = <StatusIcon status={getStatusType(mostSeriousCondition)} label={label} />;

    if (conditions.length === 0) return icon;

    return (
      <Popover
        hasAutoWidth
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
