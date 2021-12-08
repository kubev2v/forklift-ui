import * as React from 'react';
import { PageSection, Title, Toolbar, ToolbarItem, ToolbarContent } from '@patternfly/react-core';
import { LogViewer, LogViewerSearch } from '@patternfly/react-log-viewer';

import { usePodLogsQuery, useClusterPodsQuery, useClusterPodLogsQuery } from '@app/queries/pods';
import { MOCK_LOGS } from '@app/queries/mocks/logs.mock';

// interface ILogObserverProps {}

export const LogObserver: React.FunctionComponent = () => {
  const [logData, setLogData] = React.useState<string | undefined>(undefined);

  const podsQuery = useClusterPodsQuery();

  console.log('Cluster pods:', podsQuery.data);
  const podLogs = useClusterPodLogsQuery(); // standard query
  // const podLogs = usePodLogsQuery(); // mutate query

  // React.useEffect(() => {
  //   podLogs.mutate({});
  // }, []);

  // React.useEffect(() => {
  //   setLogData(logs.data);
  // }, [logs.data]);

  // logs.data && logs.data.text().then(result => setLogData(result))
  // console.log('podLogs', podLogs.data);

  React.useEffect(() => {
    podLogs.data && podLogs.data.text().then((result) => setLogData(result));
  }, [podLogs.data]);

  return (
    <LogViewer
      toolbar={
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <LogViewerSearch minSearchChars={3} placeholder="Search value" />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      }
      data={logData}
      scrollToRow={(logData && logData.length) || 0}
      height={300}
      theme="dark"
    />
  );
};
