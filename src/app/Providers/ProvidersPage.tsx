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

import { IPlan, IProviderObject } from '@app/queries/types';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { getAggregateQueryStatus } from '@app/queries/helpers';
import { QueryStatus } from 'react-query';
import { useRouteMatch } from 'react-router';

export const EditProviderContext = React.createContext({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  openEditProviderModal: (_provider: IProviderObject): void => undefined,
  plans: [] as IPlan[],
});
export interface IProvidersMatchParams {
  url: string;
  providerType: string;
}

const ProvidersPage: React.FunctionComponent = () => {
  const match = useRouteMatch<IProvidersMatchParams>({
    path: '/providers/:providerType',
    strict: true,
    sensitive: true,
  });

  const clusterProvidersQuery = useClusterProvidersQuery();
  const inventoryProvidersQuery = useInventoryProvidersQuery();
  const plansQuery = usePlansQuery();

  const allQueries = [clusterProvidersQuery, inventoryProvidersQuery, plansQuery];
  const allErrorTitles = [
    'Error loading providers from cluster API',
    'Error loading providers from inventory API',
    'Error loading plans',
  ];
  const queryStatus = getAggregateQueryStatus(allQueries);

  const clusterProviders = clusterProvidersQuery.data?.items || [];
  const areProvidersEmpty = clusterProviders.length === 0;

  const areTabsVisible = queryStatus !== QueryStatus.Loading && !areProvidersEmpty;

  const availableProviderTypes = Array.from(
    new Set(clusterProviders.map((provider) => provider.spec.type))
  ).filter((type) => !!type) as ProviderType[];

  const [activeProviderType, setActiveProviderType] = React.useState<ProviderType | null>(
    match?.params.providerType
      ? ProviderType[match?.params.providerType]
      : availableProviderTypes[0]
  );

  React.useEffect(() => {
    if (!activeProviderType && availableProviderTypes.length > 0) {
      setActiveProviderType(availableProviderTypes[0]);
    }
  }, [activeProviderType, availableProviderTypes]);

  const [isAddEditModalOpen, toggleAddEditModal] = React.useReducer((isOpen) => !isOpen, false);
  const [providerBeingEdited, setProviderBeingEdited] = React.useState<IProviderObject | null>(
    null
  );

  const toggleModalAndResetEdit = () => {
    setProviderBeingEdited(null);
    toggleAddEditModal();
  };

  const openEditProviderModal = (provider: IProviderObject) => {
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
        <ResolvedQueries results={allQueries} errorTitles={allErrorTitles} errorsInline={false}>
          <Card>
            <CardBody>
              {!clusterProvidersQuery.data || !inventoryProvidersQuery.data || areProvidersEmpty ? (
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
                    inventoryProvidersByType={inventoryProvidersQuery.data}
                    clusterProviders={clusterProviders}
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
