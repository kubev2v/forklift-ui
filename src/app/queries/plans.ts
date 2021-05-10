import * as yup from 'yup';
import { checkIfResourceExists, ForkliftResource, ForkliftResourceKind } from '@app/client/helpers';
import { IKubeList, IKubeResponse, IKubeStatus, KubeClientError } from '@app/client/types';
import { dnsLabelNameSchema, META } from '@app/common/constants';
import { usePollingContext } from '@app/common/context';
import { MutationResultPair, QueryResult, useQueryCache } from 'react-query';
import {
  mockKubeList,
  nameAndNamespace,
  sortKubeResultsByName,
  useMockableMutation,
  useMockableQuery,
} from './helpers';
import { MOCK_PLANS } from './mocks/plans.mock';
import { IPlan, Mapping, MappingType } from './types';
import { useAuthorizedK8sClient } from './fetchHelpers';
import { getMappingResource } from './mappings';
import { PlanWizardFormState } from '@app/Plans/components/Wizard/PlanWizard';
import { generateMappings, generatePlan } from '@app/Plans/components/Wizard/helpers';

const planResource = new ForkliftResource(ForkliftResourceKind.Plan, META.namespace);
const networkMapResource = getMappingResource(MappingType.Network).resource;
const storageMapResource = getMappingResource(MappingType.Storage).resource;

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
): MutationResultPair<IKubeResponse<IPlan>, KubeClientError, PlanWizardFormState, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  const { pollFasterAfterMutation } = usePollingContext();
  return useMockableMutation<IKubeResponse<IPlan>, KubeClientError, PlanWizardFormState>(
    async (forms) => {
      await checkIfResourceExists(
        client,
        ForkliftResourceKind.Plan,
        planResource,
        forms.general.values.planName
      );

      // Create mappings with generated names and collect refs to them
      const { networkMapping, storageMapping } = generateMappings({
        forms,
        generateName: `${forms.general.values.planName}-`,
      });
      const [networkMappingRef, storageMappingRef] = (
        await Promise.all([
          networkMapping && client.create<Mapping>(networkMapResource, networkMapping),
          storageMapping && client.create<Mapping>(storageMapResource, storageMapping),
        ])
      ).map((response) => nameAndNamespace(response?.data.metadata));

      // Create plan referencing new mappings
      const planResponse = await client.create<IPlan>(
        planResource,
        generatePlan(forms, networkMappingRef, storageMappingRef)
      );

      // Patch mappings with ownerReferences to new plan
      const {
        networkMapping: networkMapWithOwnerRef,
        storageMapping: storageMapWithOwnerRef,
      } = generateMappings({
        forms,
        owner: planResponse?.data,
      });
      if (networkMapWithOwnerRef && storageMapWithOwnerRef) {
        await Promise.all([
          client.patch<Mapping>(networkMapResource, networkMappingRef.name, networkMapWithOwnerRef),
          client.patch<Mapping>(storageMapResource, storageMappingRef.name, storageMapWithOwnerRef),
        ]);
      }

      return planResponse;
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries('plans');
        queryCache.invalidateQueries('mappings');
        pollFasterAfterMutation();
        onSuccess && onSuccess();
      },
    }
  );
};

interface IPatchPlanArgs {
  planBeingEdited: IPlan;
  forms: PlanWizardFormState;
}

export const usePatchPlanMutation = (
  onSuccess?: () => void
): MutationResultPair<IKubeResponse<IPlan>, KubeClientError, IPatchPlanArgs, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  const { pollFasterAfterMutation } = usePollingContext();
  return useMockableMutation<IKubeResponse<IPlan>, KubeClientError, IPatchPlanArgs>(
    async ({ planBeingEdited, forms }) => {
      const { networkMapping, storageMapping } = generateMappings({
        forms,
        owner: planBeingEdited,
      });
      const { network: networkMappingRef, storage: storageMappingRef } = planBeingEdited.spec.map;
      const updatedPlan = generatePlan(forms, networkMappingRef, storageMappingRef);
      const [, , planResponse] = await Promise.all([
        networkMapping &&
          client.patch<Mapping>(networkMapResource, networkMappingRef.name, networkMapping),
        storageMapping &&
          client.patch<Mapping>(storageMapResource, storageMappingRef.name, storageMapping),
        client.patch<IPlan>(planResource, planBeingEdited.metadata.name, updatedPlan),
      ]);
      return planResponse;
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries('plans');
        queryCache.invalidateQueries('mappings');
        pollFasterAfterMutation();
        onSuccess && onSuccess();
      },
    }
  );
};

export const useDeletePlanMutation = (
  onSuccess?: () => void
): MutationResultPair<IKubeResponse<IKubeStatus>, KubeClientError, IPlan, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  return useMockableMutation<IKubeResponse<IKubeStatus>, KubeClientError, IPlan>(
    (plan: IPlan) => client.delete(planResource, plan.metadata.name),
    {
      onSuccess: () => {
        queryCache.invalidateQueries('plans');
        queryCache.invalidateQueries('mappings');
        onSuccess && onSuccess();
      },
    }
  );
};

export const getPlanNameSchema = (
  plansQuery: QueryResult<IKubeList<IPlan>>,
  planBeingEdited: IPlan | null
): yup.StringSchema =>
  dnsLabelNameSchema.test('unique-name', 'A plan with this name already exists', (value) => {
    if (planBeingEdited?.metadata.name === value) return true;
    if (plansQuery.data?.items.find((plan) => plan.metadata.name === value)) return false;
    return true;
  });
