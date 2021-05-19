import * as yup from 'yup';
import { checkIfResourceExists, ForkliftResource, ForkliftResourceKind } from '@app/client/helpers';
import { IKubeList, IKubeResponse, IKubeStatus, KubeClientError } from '@app/client/types';
import { dnsLabelNameSchema, META } from '@app/common/constants';
import { usePollingContext } from '@app/common/context';
import { MutationResultPair, QueryResult, useQueryCache } from 'react-query';
import {
  mockKubeList,
  nameAndNamespace,
  useKubeResultsSortedByName,
  useMockableMutation,
  useMockableQuery,
} from './helpers';
import { MOCK_PLANS } from './mocks/plans.mock';
import { IHook, IPlan, Mapping, MappingType } from './types';
import { useAuthorizedK8sClient } from './fetchHelpers';
import { getMappingResource } from './mappings';
import { PlanWizardFormState } from '@app/Plans/components/Wizard/PlanWizard';
import { generateHook, generateMappings, generatePlan } from '@app/Plans/components/Wizard/helpers';

const planResource = new ForkliftResource(ForkliftResourceKind.Plan, META.namespace);
const networkMapResource = getMappingResource(MappingType.Network).resource;
const storageMapResource = getMappingResource(MappingType.Storage).resource;
const hookResource = new ForkliftResource(ForkliftResourceKind.Hook, META.namespace);

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
  return useKubeResultsSortedByName(result);
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

      const planHooks = forms.hooks.values.instances.map((instance) => ({
        cr: generateHook(instance, null, `${forms.general.values.planName}-hook-`),
        step: instance.step,
      }));

      // Create hooks CRs with generated names and collect their refs
      const newHooksRef = planHooks.map(async (newHook) => {
        const response = await client.create<IHook>(hookResource, newHook.cr);
        return { ref: nameAndNamespace(response.data.metadata), step: newHook.step };
      });

      const hooksRef = await Promise.all(newHooksRef);
      console.log(hooksRef);

      // Create plan referencing new mappings and patch plan's VMs with new hooks
      const planResponse = await client.create<IPlan>(
        planResource,
        generatePlan(forms, networkMappingRef, storageMappingRef, hooksRef)
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

      // TODO - Patch hooks with ownerReferences to the new plan
      // (call generateHook again but with the planResponse?.data)
      // const hooks: hookWithOwnerRef[] = generateHook({
      //   forms,
      //   owner: planResponse?.data,
      // });
      // if (hookWithOwnerRef) {
      //   await Promise.all([client.patch<IHook>(hookResource, hookRef.name, hookWithOwnerRef)]);
      // }

      return planResponse;
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries('plans');
        queryCache.invalidateQueries('mappings');
        queryCache.invalidateQueries('hooks');
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

      // TODO handle hooks in the API
      //  - for each instance in forms.hooks.values.instances:
      //    - if there is a prefilledFromHook property in the instance, patch that existing hook using generateHook
      //    - if not, create a new hook using generateHook
      //  - for each hook reference in the plan (plan.spec.vms[].hooks[].hook) find any that don't match instances in the form data
      //    - those were removed in the wizard, so delete the matching hook CRs

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
