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
import { useHostsQuery, useProvidersQuery } from '@app/queries';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import { IVMwareProvider } from '@app/queries/types';
import MultiQueryResultStatus from '@app/common/components/QueryResultStatus/MultiQueryResultStatus';

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

  const providersQuery = useProvidersQuery();
  const provider =
    providersQuery.data?.vsphere.find((provider) => provider.name === match?.params.providerName) ||
    null;

  const hostsQuery = useHostsQuery(provider);

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
          {hostsQuery.isLoading || providersQuery.isLoading ? (
            <LoadingEmptyState />
          ) : hostsQuery.isError || providersQuery.isError ? (
            <MultiQueryResultStatus
              results={[hostsQuery, providersQuery]}
              errorTitles={['Error loading hosts', 'Error loading providers']}
            />
          ) : !match?.params?.providerName ? (
            <Alert variant="danger" isInline title="No matching host found" />
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
                  provider={provider as IVMwareProvider}
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
