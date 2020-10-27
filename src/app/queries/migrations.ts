import { MutationResultPair, useQueryCache } from 'react-query';
import {
  VirtResource,
  VirtResourceKind,
  useClientInstance,
  checkIfResourceExists,
} from '@app/client/helpers';
import { KubeClientError } from '@app/client/types';
import { CLUSTER_API_VERSION, VIRT_META } from '@app/common/constants';
import { nameAndNamespace, useMockableMutation } from './helpers';
import { IMigration } from './types/migrations.types';
import { IPlan } from './types/plans.types';

const migrationResource = new VirtResource(VirtResourceKind.Migration, VIRT_META.namespace);

export const useCreateMigrationMutation = (
  onSuccess?: () => void
): MutationResultPair<IMigration, KubeClientError, IPlan, unknown> => {
  const client = useClientInstance();
  const queryCache = useQueryCache();
  return useMockableMutation<IMigration, KubeClientError, IPlan>(
    async (plan: IPlan) => {
      const migration: IMigration = {
        apiVersion: CLUSTER_API_VERSION,
        kind: 'Migration',
        metadata: {
          name: `${plan.metadata.name}-${Date.now()}`,
          namespace: VIRT_META.namespace,
        },
        spec: {
          plan: nameAndNamespace(plan.metadata),
        },
      };
      await checkIfResourceExists(
        client,
        VirtResourceKind.Migration,
        migrationResource,
        migration.metadata.name
      );
      return await client.create(migrationResource, migration);
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries('plans');
        onSuccess && onSuccess();
      },
    }
  );
};
