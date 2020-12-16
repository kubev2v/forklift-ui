import * as React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
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
import TruncatedText from './TruncatedText';

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
  if (status.completed && !status.error) {
    return 'Complete';
  }
  if ((status.started && !status.completed) || status.error) {
    if (status.error) return `Error - ${currentStep?.description}`;
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
  let icon: React.ReactNode;
  if (res === StepType.Full) {
    icon = (
      <ResourcesFullIcon
        color={isStepOnError(status, index) ? dangerColor.value : successColor.value}
      />
    );
  } else if (res === StepType.Half) {
    icon = (
      <ResourcesAlmostFullIcon
        color={isStepOnError(status, index) ? dangerColor.value : infoColor.value}
      />
    );
  } else {
    icon = <ResourcesEmptyIcon key={index} color={disabledColor.value} />;
  }
  return (
    <>
      {icon}
      {index < status.pipeline.length - 1 ? <Dash isReached={true} /> : null}
    </>
  );
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
        <TruncatedText>{title}</TruncatedText>
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
