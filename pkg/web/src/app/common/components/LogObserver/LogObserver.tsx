import * as React from 'react';
import {
  PageSection,
  Title,
  Toolbar,
  ToolbarItem,
  ToolbarContent,
  Dropdown,
  DropdownItem,
  DropdownToggle
} from '@patternfly/react-core';
import { LogViewer, LogViewerSearch } from '@patternfly/react-log-viewer';

import { usePodLogsQuery, useClusterPodsQuery, useClusterPodLogsQuery } from '@app/queries/pods';
import { MOCK_LOGS } from '@app/queries/mocks/logs.mock';
import CaretDownIcon from '@patternfly/react-icons/dist/esm/icons/caret-down-icon';
import { ContainerType } from '@app/queries/types';

// interface ILogObserverProps {}

export const LogObserver: React.FunctionComponent = () => {
  const [containerType, setContainerType] = React.useState<ContainerType>('controller');
  const [logData, setLogData] = React.useState<string | undefined>(undefined);

  // const podsQuery = useClusterPodsQuery(containerType);

  // console.log('Cluster pods:', podsQuery.data);
  const podLogs = useClusterPodLogsQuery(containerType); // standard query
  // const podLogs = usePodLogsQuery(containerType); // mutate query

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

  const [isContainerTypeDropdownOpen, toggleIsContainerTypeDropdownOpen] = React.useReducer((isOpen) => !isOpen, false);


  const onFocus = () => {
    const element = document.getElementById('container-type-toggle-id');
    element?.focus();
  }

  const onSelect = (event?: React.SyntheticEvent<HTMLDivElement>) => {
    toggleIsContainerTypeDropdownOpen();
    console.log('event', event?.currentTarget.innerText);
    setContainerType(event?.currentTarget.innerText as ContainerType);
    onFocus();
  }


  const dropdownItems = [
    // <DropdownItem key="main">
    //   main
    // </DropdownItem>,
    <DropdownItem key="inventory">
      inventory
    </DropdownItem>,
    <DropdownItem key="controller">
      controller
    </DropdownItem>,
  ]

  return (
    <LogViewer
      toolbar={
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <Dropdown
                onSelect={onSelect}
                isOpen={isContainerTypeDropdownOpen}
                toggle={
                  <DropdownToggle id="container-type-toggle-id" onToggle={toggleIsContainerTypeDropdownOpen} toggleIndicator={CaretDownIcon}>
                    {containerType}
                  </DropdownToggle>
                }
                dropdownItems={dropdownItems} />
            </ToolbarItem>
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
