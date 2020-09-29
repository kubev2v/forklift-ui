import React from 'react';
import {
  PageSection,
  Level,
  LevelItem,
  Bullseye,
  Card,
  CardBody,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Spinner,
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
  providerId: string;
}

export const HostsPage: React.FunctionComponent = () => {
  const match = useRouteMatch<IHostsMatchParams>({
    path: '/providers/:providerId',
    strict: true,
    sensitive: true,
  });

  const hostsQuery = useHostsQuery(match?.params?.providerId);

  return (
    <>
      <PageSection variant="light">
        <Level>
          <LevelItem>
            <Breadcrumb>
              <BreadcrumbItem>
                <Link to={`/providers`}>Providers</Link>
              </BreadcrumbItem>
              <BreadcrumbItem isActive>{match?.params.providerId} - hosts</BreadcrumbItem>
            </Breadcrumb>
          </LevelItem>
        </Level>
        <Level className={spacing.mtLg}>
          <LevelItem>
            <Title headingLevel="h1">Hosts - {match?.params.providerId}</Title>
          </LevelItem>
        </Level>
      </PageSection>
      <PageSection>
        <Card>
          {hostsQuery.isLoading ? (
            <LoadingEmptyState />
          ) : hostsQuery.isError || !match?.params.providerId ? (
            <Alert variant="danger" title="Error loading hosts" />
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
                  providerId={match?.params.providerId}
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
