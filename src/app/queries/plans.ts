import * as yup from 'yup';
import { checkIfResourceExists, VirtResource, VirtResourceKind } from '@app/client/helpers';
import { IKubeList, KubeClientError } from '@app/client/types';
import { dnsLabelNameSchema, VIRT_META } from '@app/common/constants';
import { usePollingContext } from '@app/common/context';
import { MutationResultPair, QueryResult, useQueryCache } from 'react-query';
import {
  mockKubeList,
  sortKubeResultsByName,
  useMockableMutation,
  useMockableQuery,
} from './helpers';
import { MOCK_PLANS } from './mocks/plans.mock';
import { IPlan } from './types';
import { KubeResponse, useAuthorizedK8sClient } from './fetchHelpers';

const planResource = new VirtResource(VirtResourceKind.Plan, VIRT_META.namespace);

export const usePlansQuery = (): QueryResult<IKubeList<IPlan>> => {
  const client = useAuthorizedK8sClient();
  const result = useMockableQuery<IKubeList<IPlan>>(
    {
      queryKey: 'plans',
      queryFn: async () => (await client.list<IKubeList<IPlan>>(planResource)).data,
      config: {
        refetchInterval: usePollingContext().refetchInterval,
      },
    },
    mockKubeList(MOCK_PLANS, 'Plan')
  );
  return sortKubeResultsByName(result);
};

export const useCreatePlanMutation = (
  onSuccess?: () => void
): MutationResultPair<KubeResponse<IPlan>, KubeClientError, IPlan, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  return useMockableMutation<KubeResponse<IPlan>, KubeClientError, IPlan>(
    async (plan: IPlan) => {
      await checkIfResourceExists(client, VirtResourceKind.Plan, planResource, plan.metadata.name);
      return await client.create(planResource, plan);
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries('plans');
        onSuccess && onSuccess();
      },
    }
  );
};

export const getPlanNameSchema = (plansQuery: QueryResult<IKubeList<IPlan>>): yup.StringSchema =>
  dnsLabelNameSchema.test('unique-name', 'A plan with this name already exists', (value) => {
    if (plansQuery.data?.items.find((plan) => plan.metadata.name === value)) return false;
    return true;
  });
