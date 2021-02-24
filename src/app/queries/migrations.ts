import { MutationResultPair, useQueryCache } from 'react-query';
import { ForkliftResource, ForkliftResourceKind, checkIfResourceExists } from '@app/client/helpers';
import { IKubeResponse, KubeClientError } from '@app/client/types';
import { CLUSTER_API_VERSION, META } from '@app/common/constants';
import { nameAndNamespace, useMockableMutation } from './helpers';
import { IMigration } from './types/migrations.types';
import { IPlan } from './types/plans.types';
import { useAuthorizedK8sClient } from './fetchHelpers';
import { usePollingContext } from '@app/common/context';

const migrationResource = new ForkliftResource(ForkliftResourceKind.Migration, META.namespace);

export const useCreateMigrationMutation = (
  onSuccess?: () => void
): MutationResultPair<IKubeResponse<IMigration>, KubeClientError, IPlan, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  const { pollFasterAfterMutation } = usePollingContext();
  return useMockableMutation<IKubeResponse<IMigration>, KubeClientError, IPlan>(
    async (plan: IPlan) => {
      const migration: IMigration = {
        apiVersion: CLUSTER_API_VERSION,
        kind: 'Migration',
        metadata: {
          name: `${plan.metadata.name}-${Date.now()}`,
          namespace: META.namespace,
          ownerReferences: [
            {
              apiVersion: plan.apiVersion,
              kind: plan.kind,
              name: plan.metadata.name,
              namespace: plan.metadata.namespace,
              uid: plan.metadata.uid,
            },
          ],
        },
        spec: {
          plan: nameAndNamespace(plan.metadata),
        },
      };
      await checkIfResourceExists(
        client,
        ForkliftResourceKind.Migration,
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
