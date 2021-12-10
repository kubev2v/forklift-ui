import * as React from 'react';
import {
  PageSection,
  Title,
  Toolbar,
  ToolbarItem,
  ToolbarContent,
  Dropdown,
  DropdownItem,
  DropdownToggle,
} from '@patternfly/react-core';
import { useQueryClient } from 'react-query';
import { LogViewer, LogViewerSearch } from '@patternfly/react-log-viewer';

import {
  // usePodLogsQuery,
  useClusterPodsQuery,
  useClusterPodLogsQuery,
} from '@app/queries/pods';
import { MOCK_LOGS } from '@app/queries/mocks/logs.mock';
import CaretDownIcon from '@patternfly/react-icons/dist/esm/icons/caret-down-icon';
import { ContainerType, IPodObject } from '@app/queries/types';

// interface ILogObserverProps {}

export const LogObserver: React.FunctionComponent = () => {
  const queryClient = useQueryClient();
  const [containerTypeSelection, setContainerTypeSelection] = React.useState<ContainerType>();

  const [logData, setLogData] = React.useState<string | undefined>(undefined);

  const podsQuery = useClusterPodsQuery();
  // containerTypeSelection

  const [availablePods, setAvailablePods] = React.useState<IPodObject[] | undefined>();

  const podDropDownItems = availablePods?.map((pod) => (
    <DropdownItem key={pod.metadata.name}>{pod.metadata.name}</DropdownItem>
  ));

  // console.log('podDropDownItems', podDropDownItems);

  // console.log(availablePods)

  const controllerPodName = availablePods
    ?.map((pod) => pod.metadata.name)
    .find((pod) => pod.includes('controller'));
  const [podSelection, setPodSelection] = React.useState<string | undefined>();

  React.useEffect(() => {
    setAvailablePods(podsQuery.data?.items);
    if (!podSelection) {
      // setPodSelection(podsQuery.data?.items.map(pod => pod.metadata.name).find(pod => pod.includes('controller')))
      setPodSelection(podsQuery.data?.items[0].metadata.name);
    }
  }, [podsQuery.data]);

  const [containerTypeDropDownItems, setContainerTypeDropDownItems] = React.useState<
    JSX.Element[] | undefined
  >();

  React.useEffect(() => {
    const containersForSelectedPod = podsQuery.data?.items
      .find((pod) => pod.metadata.name === podSelection)
      ?.spec.containers.map((container) => container.name)
      .map((cont) => <DropdownItem key={cont}>{cont}</DropdownItem>);
    // console.log('containers for selected pod: ', containersForSelectedPod?.map(cont => cont.key));
    setContainerTypeDropDownItems(containersForSelectedPod);
    const defaultContainerSelection = containersForSelectedPod
      ?.map((cont) => cont.key)[0]
      ?.toString();
    setContainerTypeSelection(defaultContainerSelection);
    queryClient.invalidateQueries(['pod-logs', podSelection]);
  }, [podSelection]);

  // console.log('Cluster pods:', podsQuery.data?.items);
  const podLogs = useClusterPodLogsQuery(containerTypeSelection, podSelection); // standard query
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

  const [isContainerTypeDropdownOpen, toggleIsContainerTypeDropdownOpen] = React.useReducer(
    (isOpen) => !isOpen,
    false
  );
  const [isPodSelectionDropdownOpen, toggleIsPodSelectionDropdownOpen] = React.useReducer(
    (isOpen) => !isOpen,
    false
  );

  const onFocus = () => {
    const element = document.getElementById('container-type-toggle-id');
    element?.focus();
  };

  const onContainerTypeSelect = (event?: React.SyntheticEvent<HTMLDivElement>) => {
    toggleIsContainerTypeDropdownOpen();
    // console.log('event', event?.currentTarget.innerText);
    event?.currentTarget.innerText && setContainerTypeSelection(event?.currentTarget.innerText);
    onFocus();
  };

  const onPodSelect = (event?: React.SyntheticEvent<HTMLDivElement>) => {
    toggleIsPodSelectionDropdownOpen();
    console.log('event', event?.currentTarget.innerText);
    event?.currentTarget.innerText && setPodSelection(event?.currentTarget.innerText);
    // onFocus();
  };

  console.log('podSelection', podSelection);

  return (
    <>
      {/* <div>{availablePods?.map(el => el.metadata.name).join(', ')}</div> */}
      {/* <div>{controllerPodName}</div> */}
      {podLogs.isLoading && <div>loading...</div>}
      <LogViewer
        loadingContent={<div>loading</div>}
        toolbar={
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem>
                {podDropDownItems && (
                  <Dropdown
                    onSelect={onPodSelect}
                    isOpen={isPodSelectionDropdownOpen}
                    toggle={
                      <DropdownToggle
                        id="pod-toggle-id"
                        onToggle={toggleIsPodSelectionDropdownOpen}
                        toggleIndicator={CaretDownIcon}
                      >
                        {podSelection}
                      </DropdownToggle>
                    }
                    dropdownItems={podDropDownItems}
                  />
                )}
              </ToolbarItem>
              <ToolbarItem>
                <Dropdown
                  onSelect={onContainerTypeSelect}
                  isOpen={isContainerTypeDropdownOpen}
                  toggle={
                    <DropdownToggle
                      id="container-type-toggle-id"
                      onToggle={toggleIsContainerTypeDropdownOpen}
                      toggleIndicator={CaretDownIcon}
                    >
                      {containerTypeSelection}
                    </DropdownToggle>
                  }
                  dropdownItems={containerTypeDropDownItems}
                />
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
    </>
  );
};
