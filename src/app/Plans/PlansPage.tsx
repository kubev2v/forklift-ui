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
} from '@app/queries';

import PlansTable from './components/PlansTable';
import CreatePlanButton from './components/CreatePlanButton';
import { IPlan } from '@app/queries/types';
import { IKubeResponse, KubeClientError } from '@app/client/types';
import { IMigration } from '@app/queries/types/migrations.types';
import { MutationResult } from 'react-query';
import { isSameResource } from '@app/queries/helpers';
import {
  ResolvedQuery,
  QuerySpinnerMode,
  ResolvedQueries,
} from '@app/common/components/ResolvedQuery';

const PlansPage: React.FunctionComponent = () => {
  const sufficientProvidersQuery = useHasSufficientProvidersQuery();
  const plansQuery = usePlansQuery();
  const [planBeingStarted, setPlanBeingStarted] = React.useState<IPlan | null>(null);
  const [baseCreateMigration, baseCreateMigrationResult] = useCreateMigrationMutation();
  const createMigration = (plan: IPlan | undefined) => {
    setPlanBeingStarted(plan || null);
    return baseCreateMigration(plan);
  };
  const createMigrationResult: MutationResult<IKubeResponse<IMigration>, KubeClientError> = {
    ...baseCreateMigrationResult,
    reset: () => {
      setPlanBeingStarted(null);
      baseCreateMigrationResult.reset();
    },
  };

  React.useEffect(() => {
    if (createMigrationResult.isIdle) {
      setPlanBeingStarted(null);
    }
  }, [createMigrationResult]);

  React.useEffect(() => {
    if (planBeingStarted) {
      const matchingPlan = plansQuery.data?.items.find((plan) =>
        isSameResource(plan.metadata, planBeingStarted.metadata)
      );
      if ((matchingPlan?.status?.migration?.vms?.length || 0) > 0) {
        setPlanBeingStarted(null);
      }
    }
  }, [planBeingStarted, plansQuery.data]);

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1">Migration plans</Title>
      </PageSection>
      <PageSection>
        <ResolvedQuery
          result={createMigrationResult}
          errorTitle={`Error starting migration for plan: ${planBeingStarted?.metadata.name}`}
          errorsInline={false}
          spinnerMode={QuerySpinnerMode.None}
          className={spacing.mbMd}
        />
        <ResolvedQueries
          results={[sufficientProvidersQuery.result, plansQuery]}
          errorTitles={['Error loading providers', 'Error loading plans']}
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
                  planBeingStarted={planBeingStarted}
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
