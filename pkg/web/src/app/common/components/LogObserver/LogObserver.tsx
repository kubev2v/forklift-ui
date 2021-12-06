import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { LogViewer } from '@patternfly/react-log-viewer';

import { usePodLogsQuery } from '@app/queries/logs';
import { MOCK_LOGS } from '@app/queries/mocks/logs.mock';

interface ILogObserverProps {
  // logStream?: any;
}

export const LogObserver: React.FunctionComponent<ILogObserverProps> = ({

}) => {

  const logs = usePodLogsQuery();


  React.useEffect(() => {
    logs.mutate({});

  }, []);

  console.log(logs.data);

  const initialValue: string[] = [];

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1">Log Observer</Title>
      </PageSection>

      <PageSection>
        <LogViewer data={MOCK_LOGS[4]} height={300} theme="dark" />
      </PageSection>
    </>
  )
}
