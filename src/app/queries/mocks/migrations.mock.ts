import { CLUSTER_API_VERSION, META } from '@app/common/constants';
import { nameAndNamespace } from '../helpers';
import { IMigration } from '../types/migrations.types';
import { MOCK_PLANS } from './plans.mock';

export let MOCK_MIGRATIONS: IMigration[];

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  MOCK_MIGRATIONS = [
    {
      apiVersion: CLUSTER_API_VERSION,
      kind: 'Migration',
      metadata: {
        name: 'plan-0-mock-migration',
        namespace: META.namespace,
      },
      spec: {
        plan: nameAndNamespace(MOCK_PLANS[0].metadata),
      },
      status: MOCK_PLANS[0].status?.migration,
    },
    {
      apiVersion: CLUSTER_API_VERSION,
      kind: 'Migration',
      metadata: {
        name: 'plan-1-mock-migration',
        namespace: META.namespace,
      },
      spec: {
        plan: nameAndNamespace(MOCK_PLANS[1].metadata),
      },
      status: MOCK_PLANS[1].status?.migration,
    },
    {
      apiVersion: CLUSTER_API_VERSION,
      kind: 'Migration',
      metadata: {
        name: 'plan-2-mock-migration',
        namespace: META.namespace,
      },
      spec: {
        plan: nameAndNamespace(MOCK_PLANS[2].metadata),
      },
      status: MOCK_PLANS[2].status?.migration,
    },
    {
      apiVersion: CLUSTER_API_VERSION,
      kind: 'Migration',
      metadata: {
        name: 'plan-3-mock-migration',
        namespace: META.namespace,
      },
      spec: {
        plan: nameAndNamespace(MOCK_PLANS[3].metadata),
      },
      status: MOCK_PLANS[3].status?.migration,
    },
    {
      apiVersion: CLUSTER_API_VERSION,
      kind: 'Migration',
      metadata: {
        name: 'plan-4-mock-migration',
        namespace: META.namespace,
      },
      spec: {
        plan: nameAndNamespace(MOCK_PLANS[4].metadata),
      },
      status: MOCK_PLANS[4].status?.migration,
    },
  ];
}
