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
import { MigrationVMStepsType } from '@app/common/constants';
import './PipelineSummary.css';
import { findCurrentStep } from '../helpers';

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

interface IChainProps {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  Face: React.ComponentClass<any>;
  times: number;
  color: {
    name: string;
    value: string;
    var: string;
  };
}

const Chain: React.FunctionComponent<IChainProps> = ({ Face, times, color }: IChainProps) => {
  return times < 1 ? null : (
    <>
      <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
        <Face color={color.value} />
      </FlexItem>
      {times > 1 ? (
        <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
          {color === disabledColor ? <Dash isReached={false} /> : <Dash isReached={true} />}
        </FlexItem>
      ) : null}
      <Chain Face={Face} times={times - 1} color={color} />
    </>
  );
};

interface ISummaryProps {
  title: string;
  children: React.ReactNode;
}

const Summary: React.FunctionComponent<ISummaryProps> = ({ title, children }: ISummaryProps) => (
  <Flex direction={{ default: 'column' }}>
    <FlexItem>
      <Text component="small">{title}</Text>
      <Flex
        spaceItems={{ default: 'spaceItemsNone' }}
        alignContent={{ default: 'alignContentCenter' }}
        flexWrap={{ default: 'nowrap' }}
      >
        {children}
      </Flex>
    </FlexItem>
  </Flex>
);

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

interface IPipelineSummaryProps {
  status: IVMStatus;
}

const PipelineSummary: React.FunctionComponent<IPipelineSummaryProps> = ({
  status,
}: IPipelineSummaryProps) => {
  const title = getPipelineSummaryTitle(status);
  if (status.completed) {
    return (
      <Summary title={title}>
        <Chain Face={ResourcesFullIcon} times={status.pipeline.length} color={successColor} />
      </Summary>
    );
  } else if (status.started && !status.completed) {
    const { currentStepIndex } = findCurrentStep(status.pipeline);
    return (
      <Summary title={title}>
        <Chain Face={ResourcesFullIcon} times={currentStepIndex} color={successColor} />
        {currentStepIndex > 0 ? <Dash isReached={true} /> : null}
        <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
          <ResourcesAlmostFullIcon
            color={status.error?.phase ? dangerColor.value : infoColor.value}
          />
        </FlexItem>
        {currentStepIndex > 0 ? <Dash isReached={false} /> : null}
        <Chain
          Face={ResourcesAlmostEmptyIcon}
          times={status.pipeline.length - currentStepIndex - 1}
          color={disabledColor}
        />
      </Summary>
    );
  } else {
    return (
      <Summary title={title}>
        <Chain
          Face={ResourcesAlmostEmptyIcon}
          times={status.pipeline.length}
          color={disabledColor}
        />
      </Summary>
    );
  }
};

export default PipelineSummary;
