import { MutationResultPair, QueryResult, useQueryCache } from 'react-query';
import { ForkliftResource, ForkliftResourceKind, checkIfResourceExists } from '@app/client/helpers';
import { IKubeList, IKubeResponse, KubeClientError } from '@app/client/types';
import { CLUSTER_API_VERSION, META } from '@app/common/constants';
import {
  isSameResource,
  mockKubeList,
  nameAndNamespace,
  sortKubeResultsByName,
  useMockableMutation,
  useMockableQuery,
} from './helpers';
import { ICanceledVM, IMigration } from './types/migrations.types';
import { IPlan } from './types/plans.types';
import { useAuthorizedK8sClient } from './fetchHelpers';
import { usePollingContext } from '@app/common/context';
import { getObjectRef } from '@app/common/helpers';
import { IVMwareVM } from './types/vms.types';
import { MOCK_MIGRATIONS } from './mocks/migrations.mock';

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
          ownerReferences: [getObjectRef(plan)],
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
        queryCache.invalidateQueries('migrations');
        pollFasterAfterMutation();
        onSuccess && onSuccess();
      },
    }
  );
};

export const useMigrationsQuery = (): QueryResult<IKubeList<IMigration>> => {
  const client = useAuthorizedK8sClient();
  const result = useMockableQuery<IKubeList<IMigration>>(
    {
      queryKey: 'migrations',
      queryFn: async () => (await client.list<IKubeList<IMigration>>(migrationResource)).data,
      config: {
        refetchInterval: usePollingContext().refetchInterval,
      },
    },
    mockKubeList(MOCK_MIGRATIONS, 'Migration')
  );
  return sortKubeResultsByName(result);
};

export const useLatestMigrationQuery = (plan: IPlan | null): IMigration | null => {
  const migrationsQuery = useMigrationsQuery();
  const history = plan?.status?.migration?.history;
  const latestMigrationMeta = history ? history[history.length - 1].migration : null;
  if (migrationsQuery.data && latestMigrationMeta) {
    return (
      migrationsQuery.data.items.find((migration) =>
        isSameResource(migration.metadata, latestMigrationMeta)
      ) || null
    );
  }
  return null;
};

export const useCancelVMsMutation = (
  plan: IPlan | null,
  onSuccess?: () => void
): MutationResultPair<IKubeResponse<IMigration>, KubeClientError, IVMwareVM[], unknown> => {
  const latestMigration = useLatestMigrationQuery(plan);
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  return useMockableMutation<IKubeResponse<IMigration>, KubeClientError, IVMwareVM[]>(
    (vms: IVMwareVM[]) => {
      if (!latestMigration) return Promise.reject('Could not find active Migration CR');
      const existingCanceledVMs = latestMigration.spec.cancel || [];
      const newCanceledVMs = vms
        .filter(
          (vm) =>
            !existingCanceledVMs.find(
              (canceledVM) => canceledVM.id == vm.id && canceledVM.name === vm.name
            )
        )
        .map(
          (vm): ICanceledVM => ({
            id: vm.id,
            name: vm.name,
            type: 'vsphere',
          })
        );
      const migrationPatch: Partial<IMigration> = {
        spec: {
          plan: nameAndNamespace(plan?.metadata),
          cancel: [...existingCanceledVMs, ...newCanceledVMs],
        },
      };
      return client.patch<IMigration>(
        migrationResource,
        latestMigration.metadata.name,
        migrationPatch
      );
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries('plans');
        queryCache.invalidateQueries('migrations');
        onSuccess && onSuccess();
      },
    }
  );
};
