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
  Level,
  LevelItem,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import CloudAnalyticsInfoAlert from './components/CloudAnalyticsInfoAlert';
import ProvidersTable from './components/ProvidersTable';
import { ProviderType, PROVIDER_TYPE_NAMES } from '@app/common/constants';
import AddProviderModal from './components/AddProviderModal';

// TODO replace these with real state e.g. from redux
import { MOCK_PROVIDERS } from './mocks/providers.mock';
const isFetchingInitialProviders = false; // Fetching for the first time, not polling
const providers = MOCK_PROVIDERS;

const ProvidersPage: React.FunctionComponent = () => {
  const areTabsVisible = !isFetchingInitialProviders && providers.length > 0;
  const availableProviderTypes: ProviderType[] = Object.values(
    ProviderType
  ).filter((providerType) => providers.some((provider) => provider.spec.type === providerType));
  const [activeProviderType, setActiveProviderType] = React.useState(availableProviderTypes[0]);
  const [isAddModalOpen, toggleAddModal] = React.useReducer((isOpen) => !isOpen, false);
  return (
    <>
      <PageSection variant="light" className={areTabsVisible ? spacing.pb_0 : ''}>
        <Level>
          <LevelItem>
            <Title headingLevel="h1">Providers</Title>
          </LevelItem>
          <LevelItem>
            <Button variant="secondary" onClick={toggleAddModal}>
              Add provider
            </Button>
          </LevelItem>
        </Level>
        <CloudAnalyticsInfoAlert />
        {areTabsVisible && (
          <Tabs
            activeKey={activeProviderType}
            onSelect={(_event, tabKey) => setActiveProviderType(tabKey as ProviderType)}
            className={spacing.mtSm}
          >
            {availableProviderTypes.map((providerType) => (
              <Tab
                key={providerType}
                eventKey={providerType}
                title={<TabTitleText>{PROVIDER_TYPE_NAMES[providerType]}</TabTitleText>}
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
                  <Button onClick={toggleAddModal} variant="primary">
                    Add provider
                  </Button>
                </EmptyState>
              ) : (
                <ProvidersTable providers={providers} activeProviderType={activeProviderType} />
              )}
            </CardBody>
          </Card>
        )}
      </PageSection>
      {isAddModalOpen ? <AddProviderModal onClose={toggleAddModal} /> : null}
    </>
  );
};

export default ProvidersPage;
