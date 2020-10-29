import { MutationResultPair, useQueryCache } from 'react-query';
import { VirtResource, VirtResourceKind, checkIfResourceExists } from '@app/client/helpers';
import { KubeClientError } from '@app/client/types';
import { CLUSTER_API_VERSION, VIRT_META } from '@app/common/constants';
import { nameAndNamespace, useMockableMutation } from './helpers';
import { IMigration } from './types/migrations.types';
import { IPlan } from './types/plans.types';
import { KubeResponse, useAuthorizedK8sClient } from './fetchHelpers';
import { usePollingContext } from '@app/common/context';

const migrationResource = new VirtResource(VirtResourceKind.Migration, VIRT_META.namespace);

export const useCreateMigrationMutation = (
  onSuccess?: () => void
): MutationResultPair<KubeResponse<IMigration>, KubeClientError, IPlan, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  const { pollFasterAfterMutation } = usePollingContext();
  return useMockableMutation<KubeResponse<IMigration>, KubeClientError, IPlan>(
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
        pollFasterAfterMutation();
        onSuccess && onSuccess();
      },
    }
  );
};
