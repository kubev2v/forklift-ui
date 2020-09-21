import React from 'react';
import {
  PageSection,
  Level,
  LevelItem,
  Bullseye,
  Button,
  Card,
  CardBody,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Spinner,
  Title,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import { Link, useRouteMatch } from 'react-router-dom';
import VMwareProviderHostsTable from './components/VMwareProviderHostsTable';
import { PlusCircleIcon } from '@patternfly/react-icons';

export const HostsPage: React.FunctionComponent = () => {
  interface MatchParams {
    url: string;
    providerId: string;
  }
  const match = useRouteMatch<MatchParams>({
    path: '/providers/:providerId',
    strict: true,
    sensitive: true,
  });

  const isFetchingInitialHosts = false;

  return (
    <>
      <PageSection>
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
        <Level>
          <LevelItem>
            <Title headingLevel="h1">Hosts</Title>
          </LevelItem>
        </Level>
      </PageSection>
      <PageSection>
        {isFetchingInitialHosts ? (
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
              {!match?.params.providerId ? (
                <EmptyState className={spacing.my_2xl}>
                  <EmptyStateIcon icon={PlusCircleIcon} />
                  <Title headingLevel="h2" size="lg">
                    No providers
                  </Title>
                  <EmptyStateBody>No hosts available for this provider.</EmptyStateBody>
                </EmptyState>
              ) : (
                <VMwareProviderHostsTable providerId={match?.params.providerId || ''} />
              )}
            </CardBody>
          </Card>
        )}
      </PageSection>
    </>
  );
};
