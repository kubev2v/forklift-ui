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
  useCreateMigrationMutation,
  useClusterProvidersQuery,
  useSetCutoverMutation,
} from '@app/queries';

import PlansTable from './components/PlansTable';
import CreatePlanButton from './components/CreatePlanButton';
import {
  ResolvedQuery,
  QuerySpinnerMode,
  ResolvedQueries,
} from '@app/common/components/ResolvedQuery';

const PlansPage: React.FunctionComponent = () => {
  const sufficientProvidersQuery = useHasSufficientProvidersQuery();
  const clusterProvidersQuery = useClusterProvidersQuery();
  const plansQuery = usePlansQuery();
  const [createMigration, createMigrationResult] = useCreateMigrationMutation();
  const [setCutover, setCutoverResult] = useSetCutoverMutation();

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1">Migration plans</Title>
      </PageSection>
      <PageSection>
        <ResolvedQuery
          result={createMigrationResult}
          errorTitle="Error starting migration"
          errorsInline={false}
          spinnerMode={QuerySpinnerMode.None}
          className={spacing.mbMd}
        />
        <ResolvedQuery
          result={setCutoverResult}
          errorTitle="Error setting cutover time"
          errorsInline={false}
          spinnerMode={QuerySpinnerMode.None}
          className={spacing.mbMd}
        />
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
                    Create a migration plan to select VMs to migrate to OpenShift Virtualization.
                  </EmptyStateBody>
                  <CreatePlanButton />
                </EmptyState>
              ) : (
                <PlansTable
                  plans={plansQuery.data?.items || []}
                  createMigration={createMigration}
                  createMigrationResult={createMigrationResult}
                  setCutover={setCutover}
                  setCutoverResult={setCutoverResult}
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
