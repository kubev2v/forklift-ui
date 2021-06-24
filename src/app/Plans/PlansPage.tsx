import * as React from 'react';
import {
  Card,
  PageSection,
  CardBody,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  Title,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { PlusCircleIcon } from '@patternfly/react-icons';

import {
  useHasSufficientProvidersQuery,
  usePlansQuery,
  useClusterProvidersQuery,
} from '@app/queries';

import PlansTable from './components/PlansTable';
import CreatePlanButton from './components/CreatePlanButton';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { PROVIDER_TYPE_NAMES } from '@app/common/constants';

const PlansPage: React.FunctionComponent = () => {
  const sufficientProvidersQuery = useHasSufficientProvidersQuery();
  const clusterProvidersQuery = useClusterProvidersQuery();
  const plansQuery = usePlansQuery();

  const errorContainerRef = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1">Migration plans</Title>
      </PageSection>
      <PageSection>
        <div ref={errorContainerRef} />
        <ResolvedQueries
          results={[sufficientProvidersQuery.result, clusterProvidersQuery, plansQuery]}
          errorTitles={[
            'Error loading providers',
            'Error loading providers from cluster',
            'Error loading plans',
          ]}
          errorsInline={false}
        >
          <Card>
            <CardBody>
              {!plansQuery.data ? null : plansQuery.data.items.length === 0 ? (
                <EmptyState className={spacing.my_2xl}>
                  <EmptyStateIcon icon={PlusCircleIcon} />
                  <Title size="lg" headingLevel="h2">
                    No migration plans
                  </Title>
                  <EmptyStateBody>
                    Create a migration plan to select VMs to migrate to{' '}
                    {PROVIDER_TYPE_NAMES.openshift}.
                  </EmptyStateBody>
                  <CreatePlanButton />
                </EmptyState>
              ) : (
                <PlansTable
                  plans={plansQuery.data?.items || []}
                  errorContainerRef={errorContainerRef}
                />
              )}
            </CardBody>
          </Card>
        </ResolvedQueries>
      </PageSection>
    </>
  );
};

export default PlansPage;
