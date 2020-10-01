import * as React from 'react';

import { Text } from '@patternfly/react-core';

interface IPipelineSummaryProps {
  total: number;
  current: number;
  status: string;
}

const PipelineSummary: React.FunctionComponent<IPipelineSummaryProps> = ({
  total,
  current,
  status,
}: IPipelineSummaryProps) => {
  return <Text>{status}</Text>;
};

export default PipelineSummary;
