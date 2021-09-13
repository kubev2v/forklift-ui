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
import WebSocket from 'isomorphic-ws';

import {
  useHasSufficientProvidersQuery,
  usePlansQuery,
  useClusterProvidersQuery,
  useMigrationsQuery,
} from '@app/queries';

import PlansTable from './components/PlansTable';
import CreatePlanButton from './components/CreatePlanButton';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { PROVIDER_TYPE_NAMES } from '@app/common/constants';

const PlansPage: React.FunctionComponent = () => {
  const sufficientProvidersQuery = useHasSufficientProvidersQuery();
  const clusterProvidersQuery = useClusterProvidersQuery();
  const plansQuery = usePlansQuery();
  const migrationsQuery = useMigrationsQuery();

  const errorContainerRef = React.useRef<HTMLDivElement>(null);

  // "wss://forklift-inventory-konveyor-forklift.apps.cluster-jortel.v2v.bos.redhat.com/providers/ovirt/acd5584c-fe75-453f-b970-b29a8c290254/vms";
  const url =
    'wss://forklift-inventory-konveyor-forklift.apps.cluster-jortel.v2v.bos.redhat.com/providers/ovirt/acd5584c-fe75-453f-b970-b29a8c290254/hosts';

  const ws = new WebSocket(url, {
    rejectUnauthorized: false,
    headers: { 'X-Watch': 'snapshot' },
  });

  ws.on('open', function open() {
    ws.send('something');
  });

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1">Migration plans</Title>
      </PageSection>
      <PageSection>
        <div ref={errorContainerRef} />
        <ResolvedQueries
          results={[
            sufficientProvidersQuery.result,
            clusterProvidersQuery,
            plansQuery,
            migrationsQuery,
          ]}
          errorTitles={[
            'Could not load providers',
            'Could not load providers from cluster',
            'Could not load plans',
            'Could not load migrations',
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
