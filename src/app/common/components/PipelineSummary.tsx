import * as React from 'react';
import { Flex, FlexItem, Text } from '@patternfly/react-core';
import {
  ResourcesAlmostEmptyIcon,
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
import { MigrationVMStepsType, StepType } from '@app/common/constants';
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
    return MigrationVMStepsType.Completed;
  }
  if (status.started && !status.completed) {
    let title: string;
    title = status.error?.phase ? `${MigrationVMStepsType.Error} - ` : '';
    if (currentStep) {
      title = `${title}${MigrationVMStepsType[currentStep.name] || currentStep.name}`;
    }
    return title;
  }
  return MigrationVMStepsType.NotStarted;
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
  } else return <ResourcesAlmostEmptyIcon key={index} color={disabledColor.value} />;
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
        <Text component="small">{title}</Text>
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
