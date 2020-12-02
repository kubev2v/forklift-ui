import * as React from 'react';
import {
  PageSection,
  Title,
  EmptyState,
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

import { ProviderType, PROVIDER_TYPE_NAMES } from '@app/common/constants';
import { useProvidersQuery, usePlansQuery } from '@app/queries';

import ProvidersTable from './components/ProvidersTable';
import AddEditProviderModal from './components/AddEditProviderModal';

import { checkAreProvidersEmpty } from './helpers';
import { IPlan, IProvidersByType, Provider } from '@app/queries/types';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import QueryResultStatus from '@app/common/components/QueryResultStatus';

export const EditProviderContext = React.createContext({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  openEditProviderModal: (_provider: Provider): void => undefined,
  plans: [] as IPlan[],
});

const ProvidersPage: React.FunctionComponent = () => {
  const providersQuery = useProvidersQuery();
  const plansQuery = usePlansQuery();

  const areProvidersEmpty = checkAreProvidersEmpty(providersQuery.data);
  const areTabsVisible = !providersQuery.isLoading && !plansQuery.isLoading && !areProvidersEmpty;
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

  const [isAddEditModalOpen, toggleAddEditModal] = React.useReducer((isOpen) => !isOpen, false);
  const [providerBeingEdited, setProviderBeingEdited] = React.useState<Provider | null>(null);

  const toggleModalAndResetEdit = () => {
    setProviderBeingEdited(null);
    toggleAddEditModal();
  };

  const openEditProviderModal = (provider: Provider) => {
    setProviderBeingEdited(provider);
    toggleAddEditModal();
  };

  return (
    <>
      <PageSection variant="light" className={areTabsVisible ? spacing.pb_0 : ''}>
        <Level>
          <LevelItem>
            <Title headingLevel="h1">Providers</Title>
          </LevelItem>
          <LevelItem>
            <Button variant="secondary" onClick={toggleModalAndResetEdit}>
              Add provider
            </Button>
          </LevelItem>
        </Level>
        {/* TODO restore this when https://github.com/konveyor/forklift-ui/issues/281 is settled
        <CloudAnalyticsInfoAlert />
        */}
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
        {providersQuery.isLoading || plansQuery.isLoading ? (
          <LoadingEmptyState />
        ) : providersQuery.isError ? (
          <QueryResultStatus result={providersQuery} errorTitle="Error loading providers" />
        ) : plansQuery.isError ? (
          <QueryResultStatus result={plansQuery} errorTitle="Error loading plans" />
        ) : (
          <Card>
            <CardBody>
              {!providersQuery.data || areProvidersEmpty ? (
                <EmptyState className={spacing.my_2xl}>
                  <EmptyStateIcon icon={PlusCircleIcon} />
                  <Title headingLevel="h2" size="lg">
                    No providers
                  </Title>
                  <EmptyStateBody>Add source and target providers for migrations.</EmptyStateBody>
                  <Button onClick={toggleModalAndResetEdit} variant="primary">
                    Add provider
                  </Button>
                </EmptyState>
              ) : !activeProviderType ? null : (
                <EditProviderContext.Provider
                  value={{ openEditProviderModal, plans: plansQuery.data?.items || [] }}
                >
                  <ProvidersTable
                    providersByType={providersQuery.data}
                    activeProviderType={activeProviderType}
                  />
                </EditProviderContext.Provider>
              )}
            </CardBody>
          </Card>
        )}
      </PageSection>
      {isAddEditModalOpen ? (
        <AddEditProviderModal
          onClose={toggleModalAndResetEdit}
          providerBeingEdited={providerBeingEdited}
        />
      ) : null}
    </>
  );
};

export default ProvidersPage;
