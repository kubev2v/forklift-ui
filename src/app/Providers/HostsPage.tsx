import React from 'react';
import {
  PageSection,
  Level,
  LevelItem,
  Card,
  CardBody,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Title,
  Alert,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import { Link, useRouteMatch } from 'react-router-dom';
import VMwareProviderHostsTable from './components/VMwareProviderHostsTable';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useHostsQuery } from '@app/queries';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';

export interface IHostsMatchParams {
  url: string;
  providerName: string;
}

export const HostsPage: React.FunctionComponent = () => {
  const match = useRouteMatch<IHostsMatchParams>({
    path: '/providers/:providerName',
    strict: true,
    sensitive: true,
  });

  const hostsQuery = useHostsQuery(match?.params.providerName);

  return (
    <>
      <PageSection variant="light">
        <Level>
          <LevelItem>
            <Breadcrumb>
              <BreadcrumbItem>
                <Link to={`/providers`}>Providers</Link>
              </BreadcrumbItem>
              <BreadcrumbItem>{match?.params.providerName}</BreadcrumbItem>
              <BreadcrumbItem isActive>Hosts</BreadcrumbItem>
            </Breadcrumb>
          </LevelItem>
        </Level>
        <Level className={spacing.mtLg}>
          <LevelItem>
            <Title headingLevel="h1">Hosts - {match?.params.providerName}</Title>
          </LevelItem>
        </Level>
      </PageSection>
      <PageSection>
        <Card>
          {hostsQuery.isIdle || hostsQuery.isLoading ? (
            <LoadingEmptyState />
          ) : hostsQuery.isError || !match?.params?.providerName ? (
            <Alert variant="danger" isInline title="Error loading hosts" />
          ) : (
            <CardBody>
              {!hostsQuery.data ? null : hostsQuery?.data?.length === 0 ? (
                <EmptyState className={spacing.my_2xl}>
                  <EmptyStateIcon icon={PlusCircleIcon} />
                  <Title headingLevel="h2" size="lg">
                    No hosts
                  </Title>
                  <EmptyStateBody>No hosts available for this provider.</EmptyStateBody>
                </EmptyState>
              ) : (
                <VMwareProviderHostsTable
                  providerName={match?.params.providerName || ''}
                  hosts={hostsQuery?.data}
                />
              )}
            </CardBody>
          )}
        </Card>
      </PageSection>
    </>
  );
};
