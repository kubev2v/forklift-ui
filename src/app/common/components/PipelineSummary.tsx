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
import './PipelineSummary.css';
import { MigrationVMStepsType } from '@app/common/constants';

interface IPipelineSummaryProps {
  status: IVMStatus;
}

const Dash = (isReached: boolean): JSX.Element => {
  return (
    <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
      {isReached ? <div className="dash dashReached" /> : <div className="dash dashNotReached" />}
    </FlexItem>
  );
};

const PipelineSummary: React.FunctionComponent<IPipelineSummaryProps> = ({
  status,
}: IPipelineSummaryProps) => {
  let title: string;
  let summary: JSX.Element;

  const Chain = (Face, times, color) => {
    return times < 1 ? null : (
      <>
        <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
          <Face color={color.value} />
        </FlexItem>
        {times > 1 ? (
          <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
            {color === disabledColor ? Dash(false) : Dash(true)}
          </FlexItem>
        ) : null}
        {Chain(Face, times - 1, color)}
      </>
    );
  };

  if (status.completed) {
    title = MigrationVMStepsType.Completed;
    summary = Chain(ResourcesFullIcon, status.pipeline.length, successColor);
  } else if (status.started && !status.completed) {
    if (status.error.phase) {
      title =
        MigrationVMStepsType.Error +
        ' - ' +
        MigrationVMStepsType[status.pipeline[status.step - 1].name];
    } else title = MigrationVMStepsType[status.pipeline[status.step - 1].name];
    const full = Chain(ResourcesFullIcon, status.step - 1, successColor);
    const empty = Chain(
      ResourcesAlmostEmptyIcon,
      status.pipeline.length - status.step,
      disabledColor
    );
    summary = (
      <>
        {full}
        {full ? Dash(true) : null}
        <FlexItem alignSelf={{ default: 'alignSelfCenter' }}>
          <ResourcesAlmostFullIcon
            color={status.error.phase ? dangerColor.value : infoColor.value}
          />
        </FlexItem>
        {empty ? Dash(false) : null}
        {empty}
      </>
    );
  } else {
    title = MigrationVMStepsType.NotStarted;
    summary = Chain(ResourcesAlmostEmptyIcon, status.pipeline.length, disabledColor);
  }

  return (
    <FlexItem>
      <Text component="small">{title}</Text>
      <Flex
        spaceItems={{ default: 'spaceItemsNone' }}
        alignContent={{ default: 'alignContentCenter' }}
      >
        {summary}
      </Flex>
    </FlexItem>
  );
};

export default PipelineSummary;
