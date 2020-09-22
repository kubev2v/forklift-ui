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
  Alert,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { ProviderType, PROVIDER_TYPE_NAMES } from '@app/common/constants';
import { useProvidersQuery } from '@app/queries';

import CloudAnalyticsInfoAlert from './components/CloudAnalyticsInfoAlert';
import ProvidersTable from './components/ProvidersTable';
import AddProviderModal from './components/AddProviderModal';

import { checkAreProvidersEmpty } from './helpers';
import { IProvidersByType } from '@app/queries/types';

const ProvidersPage: React.FunctionComponent = () => {
  const providersQuery = useProvidersQuery();

  const areProvidersEmpty = checkAreProvidersEmpty(providersQuery.data);
  const areTabsVisible = !providersQuery.isLoading && !areProvidersEmpty;
  const availableProviderTypes: ProviderType[] = !providersQuery.data
    ? []
    : Object.keys(providersQuery.data)
        .filter((key) => (providersQuery.data as IProvidersByType)[ProviderType[key]].length > 0)
        .map((key) => ProviderType[key]);
  const [activeProviderType, setActiveProviderType] = React.useState<ProviderType | null>(
    availableProviderTypes[0]
  );
  React.useEffect(() => {
    if (!activeProviderType && availableProviderTypes.length > 0) {
      setActiveProviderType(availableProviderTypes[0]);
    }
  }, [activeProviderType, availableProviderTypes]);

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
            activeKey={activeProviderType || ''}
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
        {providersQuery.isLoading ? (
          <Bullseye>
            <EmptyState>
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2">Loading...</Title>
            </EmptyState>
          </Bullseye>
        ) : status === 'error' ? (
          <Alert variant="danger" title="Error loading providers" />
        ) : (
          <Card>
            <CardBody>
              {!providersQuery.data || !activeProviderType ? null : areProvidersEmpty ? (
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
                <ProvidersTable
                  providersByType={providersQuery.data}
                  activeProviderType={activeProviderType}
                />
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
