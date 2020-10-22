import {
  checkIfResourceExists,
  useClientInstance,
  VirtResource,
  VirtResourceKind,
} from '@app/client/helpers';
import { IKubeList, KubeClientError } from '@app/client/types';
import { VIRT_META } from '@app/common/constants';
import { usePollingContext } from '@app/common/context';
import { MutationResultPair, QueryResult, useQueryCache } from 'react-query';
import { POLLING_INTERVAL } from './constants';
import {
  mockKubeList,
  sortKubeResultsByName,
  useMockableMutation,
  useMockableQuery,
} from './helpers';
import { MOCK_PLANS } from './mocks/plans.mock';
import { IPlan } from './types';

const planResource = new VirtResource(VirtResourceKind.Plan, VIRT_META.namespace);

export const usePlansQuery = (): QueryResult<IKubeList<IPlan>> => {
  const client = useClientInstance();
  const result = useMockableQuery<IKubeList<IPlan>>(
    {
      queryKey: 'plans',
      queryFn: async () => (await client.list(planResource)).data,
      config: { refetchInterval: usePollingContext().isPollingEnabled ? POLLING_INTERVAL : false },
    },
    mockKubeList(MOCK_PLANS, 'Plan')
  );
  return sortKubeResultsByName(result);
};

export const useCreatePlanMutation = (
  onSuccess: () => void
): MutationResultPair<IPlan, KubeClientError, IPlan, unknown> => {
  const client = useClientInstance();
  const queryCache = useQueryCache();
  return useMockableMutation<IPlan, KubeClientError, IPlan>(
    async (plan: IPlan) => {
      await checkIfResourceExists(client, VirtResourceKind.Plan, planResource, plan.metadata.name);
      return await client.create(planResource, plan);
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries('plans');
        onSuccess();
      },
    }
  );
};
