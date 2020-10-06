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

interface IPipelineSummaryProps {
  status: IVMStatus;
}

const PipelineSummary: React.FunctionComponent<IPipelineSummaryProps> = ({
  status,
}: IPipelineSummaryProps) => {
  let sum: React.ReactNode;

  const chain = (Face, times, color) => {
    return times < 1 ? null : (
      <>
        <Face color={color.value} />
        {times > 1 ? `-` : null}
        {chain(Face, times - 1, color)}
      </>
    );
  };

  if (status.completed) {
    sum = chain(ResourcesFullIcon, status.pipeline.length, successColor);
  } else if (status.started && !status.completed) {
    const full = chain(ResourcesFullIcon, status.step - 1, successColor);
    const empty = chain(
      ResourcesAlmostEmptyIcon,
      status.pipeline.length - status.step,
      disabledColor
    );
    sum = (
      <>
        {full}
        {full ? '-' : null}
        <ResourcesAlmostFullIcon color={status.error.phase ? dangerColor.value : infoColor.value} />
        {empty ? '-' : null}
        {empty}
      </>
    );
  } else {
    sum = chain(ResourcesAlmostEmptyIcon, status.pipeline.length, disabledColor);
  }

  return (
    <>
      <Text component="small">
        Step {status.step} of {status.pipeline.length}
      </Text>
      <Flex>
        <FlexItem>{sum}</FlexItem>
      </Flex>
    </>
  );
};

export default PipelineSummary;
