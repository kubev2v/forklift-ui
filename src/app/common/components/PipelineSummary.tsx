import * as React from 'react';
import { Flex } from '@patternfly/react-core';
import {
  MinusIcon,
  ResourcesAlmostEmptyIcon,
  ResourcesAlmostFullIcon,
  ResourcesFullIcon,
} from '@patternfly/react-icons';

import { IVMStatus } from '@app/queries/types';

interface IPipelineSummaryProps {
  status: IVMStatus;
}

const Dash = MinusIcon;

const pipe = (Face, times) => {
  return times === 0 ? null : (
    <>
      <Face />
      {times > 1 ? <Dash /> : null}
      {pipe(Face, times - 1)}
    </>
  );
};

const PipelineSummary: React.FunctionComponent<IPipelineSummaryProps> = ({
  status,
}: IPipelineSummaryProps) => {
  let full: React.ReactNode;
  let half: React.ReactNode;
  let empty: React.ReactNode;

  if (status.completed) {
    full = pipe(ResourcesFullIcon, status.pipeline.length);
  } else if (status.started && !status.completed) {
    full = pipe(ResourcesFullIcon, status.step - 1);
    half = pipe(ResourcesAlmostFullIcon, 1);
    empty = pipe(ResourcesAlmostEmptyIcon, status.pipeline.length - status.step);
  } else {
    empty = pipe(ResourcesAlmostEmptyIcon, status.pipeline.length);
  }

  return (
    <Flex>
      {full}
      {half ? <Dash /> : null}
      {half}
      {half ? <Dash /> : null}
      {empty}
    </Flex>
  );
};

export default PipelineSummary;
