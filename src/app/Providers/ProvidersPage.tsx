import * as React from 'react';
import {
  PageSection,
  Title,
  Bullseye,
  EmptyState,
  Spinner,
  Card,
  CardBody,
  EmptyStateIcon,
  Button,
  EmptyStateBody,
  Tabs,
  Tab,
  TabTitleText,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

// TODO replace these flags with real state e.g. from redux
const isFetchingInitialProviders = false; // Fetching for the first time, not polling
const providers = [{ mock: 'provider' }]; // TODO make a real mock here and move it somewhere common for now

interface ITab {
  type: string;
  title: string;
}

const ProvidersPage: React.FunctionComponent = () => {
  const areTabsVisible = !isFetchingInitialProviders && providers.length > 0;
  // TODO generate/filter this list of tabs from the available provider types, and use real constants
  const tabs: ITab[] = [
    { type: 'vmware', title: 'VMWare' },
    { type: 'cnv', title: 'OpenShift virtualization' },
  ];
  const [activeTabType, setActiveTabType] = React.useState(tabs[0].type);
  return (
    <>
      <PageSection variant="light" className={areTabsVisible ? spacing.pb_0 : ''}>
        <Title headingLevel="h1">Providers</Title>
        {areTabsVisible && (
          <Tabs
            activeKey={activeTabType}
            onSelect={(_event, tabKey) => setActiveTabType(tabKey as string)}
            className={spacing.mtSm}
            isBox
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.type}
                eventKey={tab.type}
                title={<TabTitleText>{tab.title}</TabTitleText>}
              />
            ))}
          </Tabs>
        )}
      </PageSection>
      <PageSection>
        {isFetchingInitialProviders ? (
          <Bullseye>
            <EmptyState>
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2">Loading...</Title>
            </EmptyState>
          </Bullseye>
        ) : (
          <Card>
            <CardBody>
              {!providers ? null : providers.length === 0 ? (
                <EmptyState className={spacing.my_2xl}>
                  <EmptyStateIcon icon={PlusCircleIcon} />
                  <Title headingLevel="h2" size="lg">
                    No providers
                  </Title>
                  <EmptyStateBody>Add source and target providers for migrations.</EmptyStateBody>
                  <Button
                    onClick={() => {
                      /* eslint-ignore */
                    }}
                    variant="primary"
                  >
                    Add provider
                  </Button>
                </EmptyState>
              ) : (
                // TODO make a ProvidersTable component here and pass the active tab as a prop
                <div>Tab content here! {tabs.find((tab) => tab.type === activeTabType)?.title}</div>
              )}
            </CardBody>
          </Card>
        )}
      </PageSection>
    </>
  );
};

export default ProvidersPage;
