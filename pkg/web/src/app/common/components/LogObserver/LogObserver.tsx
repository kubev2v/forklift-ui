import * as React from 'react';
import { PageSection, Title, Toolbar, ToolbarItem, ToolbarContent } from '@patternfly/react-core';
import { LogViewer, LogViewerSearch } from '@patternfly/react-log-viewer';

import { usePodLogsQuery } from '@app/queries/logs';
import { MOCK_LOGS } from '@app/queries/mocks/logs.mock';

interface ILogObserverProps {

}

export const LogObserver: React.FunctionComponent<ILogObserverProps> = () => {
  const logs = usePodLogsQuery();

  React.useEffect(() => {
    logs.mutate({});
  }, []);

  logs.data && logs.data.text().then(result => console.log(result))

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1">Log Observer</Title>
      </PageSection>

      <PageSection>
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
          data={MOCK_LOGS[4]}
          height={300}
          theme="dark" />
      </PageSection>
    </>
  );
};
