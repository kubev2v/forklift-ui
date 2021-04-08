import { CLUSTER_API_VERSION, META } from '@app/common/constants';
import { nameAndNamespace } from '../helpers';
import { IMigration } from '../types/migrations.types';
import { MOCK_PLANS } from './plans.mock';

export let MOCK_MIGRATIONS: IMigration[];

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  const runningPlanIndexes = [0, 2, 3, 4, 6, 7, 8, 9];
  MOCK_MIGRATIONS = runningPlanIndexes.map((index) => ({
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Migration',
    metadata: {
      name: `plan-${index}-mock-migration`,
      namespace: META.namespace,
    },
    spec: {
      plan: nameAndNamespace(MOCK_PLANS[index].metadata),
    },
    status: MOCK_PLANS[index].status?.migration,
  }));

  // plantest-03 (plan index 2) and plantest-10 (plan index 9) have canceled VMs
  const cancelSpec = [
    {
      id: 'vm-1630',
      name: 'fdupont-test-migration',
    },
  ];
  MOCK_MIGRATIONS[1].spec.cancel = cancelSpec;
  MOCK_MIGRATIONS[7].spec.cancel = cancelSpec;

  // plantest-8 (plan index 7) is in cutover
  MOCK_MIGRATIONS[5].spec.cutover = '2021-03-16T18:31:30Z';
}
