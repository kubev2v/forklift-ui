import * as React from 'react';
import { Flex, FlexItem, Text, Tooltip } from '@patternfly/react-core';
import {
  ResourcesEmptyIcon,
  ResourcesAlmostFullIcon,
  ResourcesFullIcon,
} from '@patternfly/react-icons';
import {
  global_danger_color_100 as dangerColor,
  global_disabled_color_200 as disabledColor,
  global_info_color_100 as infoColor,
  global_success_color_100 as successColor,
} from '@patternfly/react-tokens';

import { IVMStatus } from '@app/queries/types';
import { StepType } from '@app/common/constants';
import './PipelineSummary.css';
import { findCurrentStep, getStepType, isStepOnError } from '../helpers';

interface IDashProps {
  isReached: boolean;
}

const Dash: React.FunctionComponent<IDashProps> = ({ isReached }: IDashProps) => {
  return (
    <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
      {isReached ? <div className="dash dashReached" /> : <div className="dash dashNotReached" />}
    </FlexItem>
  );
};

export const getPipelineSummaryTitle = (status: IVMStatus): string => {
  const { currentStep } = findCurrentStep(status.pipeline);
  if (status.completed) {
    return 'Complete';
  }
  if (status.started && !status.completed) {
    if (status.error) return `error - ${currentStep?.description}`;
    if (currentStep?.description) return currentStep.description;
  }
  return 'Not started';
};

interface IGetStepTypeIcon {
  status: IVMStatus;
  index: number;
}

const GetStepTypeIcon: React.FunctionComponent<IGetStepTypeIcon> = ({
  status,
  index,
}: IGetStepTypeIcon) => {
  const res = getStepType(status, index);
  if (res === StepType.Full) {
    return (
      <>
        <ResourcesFullIcon
          color={isStepOnError(status, index) ? dangerColor.value : successColor.value}
        />
        {index < status.pipeline.length - 1 ? <Dash isReached={true} /> : null}
      </>
    );
  } else if (res === StepType.Half) {
    return (
      <>
        <ResourcesAlmostFullIcon
          color={isStepOnError(status, index) ? dangerColor.value : infoColor.value}
        />
        {index < status.pipeline.length - 1 ? <Dash isReached={true} /> : null}
      </>
    );
  } else return <ResourcesEmptyIcon key={index} color={disabledColor.value} />;
};

interface IPipelineSummaryProps {
  status: IVMStatus;
}
const PipelineSummary: React.FunctionComponent<IPipelineSummaryProps> = ({
  status,
}: IPipelineSummaryProps) => {
  const title = getPipelineSummaryTitle(status);

  return (
    <Flex direction={{ default: 'column' }}>
      <FlexItem>
        <Tooltip content={title}>
          <Text component="small">{title}</Text>
        </Tooltip>
        <Flex
          spaceItems={{ default: 'spaceItemsNone' }}
          alignContent={{ default: 'alignContentCenter' }}
          flexWrap={{ default: 'nowrap' }}
        >
          {status.pipeline.map((_, index) => (
            <GetStepTypeIcon key={index} status={status} index={index} />
          ))}
        </Flex>
      </FlexItem>
    </Flex>
  );
};

export default PipelineSummary;
