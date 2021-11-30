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
import { VMwareProviderHostsTable } from './components/VMwareProviderHostsTable';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
import { useHostsQuery, useInventoryProvidersQuery } from '@app/queries';
import { IVMwareProvider } from '@app/queries/types';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { PROVIDER_TYPE_NAMES } from '@app/common/constants';

export interface IHostsMatchParams {
  url: string;
  providerName: string;
}

export const HostsPage: React.FunctionComponent = () => {
  const match = useRouteMatch<IHostsMatchParams>({
    path: '/providers/vsphere/:providerName',
    strict: true,
    sensitive: true,
  });

  const providersQuery = useInventoryProvidersQuery();
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
              <BreadcrumbItem>Providers</BreadcrumbItem>
              <BreadcrumbItem>
                <Link to={`/providers/vsphere`}>{PROVIDER_TYPE_NAMES.vsphere}</Link>
              </BreadcrumbItem>
              <BreadcrumbItem>{match?.params.providerName}</BreadcrumbItem>
              <BreadcrumbItem isActive>Hosts</BreadcrumbItem>
            </Breadcrumb>
          </LevelItem>
        </Level>
        <Level className={spacing.mtLg}>
          <LevelItem>
            <Title headingLevel="h1">Hosts</Title>
          </LevelItem>
        </Level>
      </PageSection>
      <PageSection>
        <ResolvedQueries
          results={[hostsQuery, providersQuery]}
          errorTitles={['Cannot load hosts', 'Cannot load providers']}
          errorsInline={false}
        >
          {!match?.params?.providerName ? (
            <Alert variant="danger" title="No matching host found" />
          ) : (
            <Card>
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
            </Card>
          )}
        </ResolvedQueries>
      </PageSection>
    </>
  );
};
