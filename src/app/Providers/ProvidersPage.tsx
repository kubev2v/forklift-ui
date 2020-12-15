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
import { useClusterProvidersQuery, useInventoryProvidersQuery, usePlansQuery } from '@app/queries';

import ProvidersTable from './components/ProvidersTable';
import AddEditProviderModal from './components/AddEditProviderModal';

import { checkAreProvidersEmpty } from './helpers';
import { IPlan, IProvidersByType, InventoryProvider } from '@app/queries/types';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';

export const EditProviderContext = React.createContext({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  openEditProviderModal: (_provider: InventoryProvider): void => undefined,
  plans: [] as IPlan[],
});

const ProvidersPage: React.FunctionComponent = () => {
  const inventoryProvidersQuery = useInventoryProvidersQuery();
  const clusterProvidersQuery = useClusterProvidersQuery();

  console.log('cluster providers: ', clusterProvidersQuery.data);

  const plansQuery = usePlansQuery();

  const areProvidersEmpty = checkAreProvidersEmpty(inventoryProvidersQuery.data);
  const areTabsVisible =
    !inventoryProvidersQuery.isLoading && !plansQuery.isLoading && !areProvidersEmpty;
  const availableProviderTypes: ProviderType[] = Object.keys(inventoryProvidersQuery.data || [])
    .filter(
      (key) => (inventoryProvidersQuery.data as IProvidersByType)[ProviderType[key]].length > 0
    )
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
  const [providerBeingEdited, setProviderBeingEdited] = React.useState<InventoryProvider | null>(
    null
  );

  const toggleModalAndResetEdit = () => {
    setProviderBeingEdited(null);
    toggleAddEditModal();
  };

  const openEditProviderModal = (provider: InventoryProvider) => {
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
        <ResolvedQueries
          results={[inventoryProvidersQuery, plansQuery]}
          errorTitles={['Error loading providers', 'Error loading plans']}
          errorsInline={false}
        >
          <Card>
            <CardBody>
              {!inventoryProvidersQuery.data || areProvidersEmpty ? (
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
                    providersByType={inventoryProvidersQuery.data}
                    activeProviderType={activeProviderType}
                  />
                </EditProviderContext.Provider>
              )}
            </CardBody>
          </Card>
        </ResolvedQueries>
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
