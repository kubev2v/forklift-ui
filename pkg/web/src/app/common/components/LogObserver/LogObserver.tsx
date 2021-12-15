import * as React from 'react';
import {
  Card,
  Toolbar,
  ToolbarItem,
  ToolbarContent,
  Dropdown,
  DropdownItem,
  DropdownToggle,
} from '@patternfly/react-core';

import { LogViewer, LogViewerSearch } from '@patternfly/react-log-viewer';

import { useClusterPodsQuery, useClusterPodLogsQuery } from '@app/queries/pods';

import CaretDownIcon from '@patternfly/react-icons/dist/esm/icons/caret-down-icon';
import { ContainerType, IPlan, IPodObject } from '@app/queries/types';

interface ILogObserver {
  plan: IPlan;
  namespace: string;
}

export const LogObserver: React.FunctionComponent<ILogObserver> = ({ plan, namespace }) => {
  const [containerTypeSelection, setContainerTypeSelection] = React.useState<ContainerType>();

  const [logData, setLogData] = React.useState<string | undefined>(undefined);

  const podsQuery = useClusterPodsQuery(namespace);

  const [availablePods, setAvailablePods] = React.useState<IPodObject[] | undefined>();

  const podDropDownItems =
    availablePods?.length &&
    availablePods?.map((pod) => (
      <DropdownItem key={pod.metadata.name}>{pod.metadata.name}</DropdownItem>
    ));

  const [podSelection, setPodSelection] = React.useState<string | undefined>();

  React.useEffect(() => {
    setAvailablePods(podsQuery.data?.items);
    if (!podSelection) {
      setPodSelection(podsQuery.data?.items[0].metadata.name);
    }
  }, [podsQuery.data, podSelection]);

  const [containerTypeDropDownItems, setContainerTypeDropDownItems] = React.useState<
    JSX.Element[] | undefined
  >();

  React.useEffect(() => {
    const containersForSelectedPod = podsQuery.data?.items
      .find((pod) => pod.metadata.name === podSelection)
      ?.spec.containers.map((container) => container.name)
      .map((cont) => <DropdownItem key={cont}>{cont}</DropdownItem>);

    setContainerTypeDropDownItems(containersForSelectedPod);
    const defaultContainerSelection = containersForSelectedPod
      ?.map((cont) => cont.key)[0]
      ?.toString();
    setContainerTypeSelection(defaultContainerSelection);
  }, [podSelection, podsQuery.data?.items]);

  const podLogs = useClusterPodLogsQuery(namespace, containerTypeSelection, podSelection);

  React.useEffect(() => {
    podLogs.data &&
      podLogs.data.text &&
      podLogs.data.text().then((result) => {
        setLogData(result);
      });
  }, [podLogs.data]);

  const [isContainerTypeDropdownOpen, toggleIsContainerTypeDropdownOpen] = React.useReducer(
    (isOpen) => !isOpen,
    false
  );
  const [isPodSelectionDropdownOpen, toggleIsPodSelectionDropdownOpen] = React.useReducer(
    (isOpen) => !isOpen,
    false
  );

  const onPodSelectionFocus = () => {
    const element = document.getElementById('pod-toggle-id');
    element?.focus();
  };

  const onContainerTypeSelectionFocus = () => {
    const element = document.getElementById('container-type-toggle-id');
    element?.focus();
  };

  const onContainerTypeSelect = (event?: React.SyntheticEvent<HTMLDivElement>) => {
    toggleIsContainerTypeDropdownOpen();
    event?.currentTarget.innerText && setContainerTypeSelection(event?.currentTarget.innerText);
    onContainerTypeSelectionFocus();
  };

  const onPodSelect = (event?: React.SyntheticEvent<HTMLDivElement>) => {
    toggleIsPodSelectionDropdownOpen();
    event?.currentTarget.innerText && setPodSelection(event?.currentTarget.innerText);

    const containersForPod = availablePods
      ?.find((pod) => pod.metadata.name === event?.currentTarget.innerText)
      ?.spec.containers.map((container) => container.name)
      .map((cont) => <DropdownItem key={cont}>{cont}</DropdownItem>);

    containersForPod && setContainerTypeSelection(containersForPod[0].key?.toString());
    onPodSelectionFocus();
  };

  return (
    <Card>
      <LogViewer
        loadingContent={
          podsQuery.isLoading ? (
            <div>loading pods...</div>
          ) : podLogs.isLoading ? (
            <div>loading logs...</div>
          ) : (
            <div>loading...</div>
          )
        }
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
                        id={`${namespace}-pod-toggle-id`}
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
                      id={`${namespace}-container-type-toggle-id`}
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
    </Card>
  );
};
