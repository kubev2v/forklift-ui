import { MutationResultPair, QueryResult, useQueryCache } from 'react-query';
import * as yup from 'yup';
import yaml from 'js-yaml';

import { ForkliftResource, ForkliftResourceKind } from '@app/client/helpers';
import { IKubeList, IKubeResponse, IKubeStatus, KubeClientError } from '@app/client/types';
import { META } from '@app/common/constants';
import { usePollingContext } from '@app/common/context';
import {
  mockKubeList,
  sortKubeResultsByName,
  useMockableMutation,
  useMockableQuery,
} from './helpers';
import { MOCK_HOOKS } from './mocks/hooks.mock';
import { IHook, IMetaObjectMeta } from './types';
import { useAuthorizedK8sClient } from './fetchHelpers';
import { generateHook } from '@app/Plans/components/Wizard/helpers';
import { PlanHookInstance } from '@app/Plans/components/Wizard/PlanAddEditHookModal';

const hookResource = new ForkliftResource(ForkliftResourceKind.Hook, META.namespace);

export const useHooksQuery = (): QueryResult<IKubeList<IHook>> => {
  const client = useAuthorizedK8sClient();
  const result = useMockableQuery<IKubeList<IHook>>(
    {
      queryKey: 'hooks',
      queryFn: async () => (await client.list<IKubeList<IHook>>(hookResource)).data,
      config: {
        refetchInterval: usePollingContext().refetchInterval,
      },
    },
    mockKubeList(MOCK_HOOKS, 'Hook')
  );
  return sortKubeResultsByName(result);
};

// TODO we probably don't need the dedicated useCreateHookMutation? only will patch as part of patching a plan
export const useCreateHookMutation = (
  planName: string,
  onSuccess?: () => void
): MutationResultPair<IKubeResponse<IHook>, KubeClientError, PlanHookInstance, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  const { pollFasterAfterMutation } = usePollingContext();
  return useMockableMutation<IKubeResponse<IHook>, KubeClientError, PlanHookInstance>(
    async (instance) => {
      const hookResponse = await client.create<IHook>(
        hookResource,
        generateHook(instance, null, planName)
      );
      return hookResponse;
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries('hooks');
        pollFasterAfterMutation();
        onSuccess && onSuccess();
      },
    }
  );
};

interface IPatchHookArgs {
  hookBeingEdited: IHook;
  hookFormInstance: PlanHookInstance;
}

// TODO we probably don't need the dedicated usePatchHookMutation? only will patch as part of patching a plan
export const usePatchHookMutation = (
  planName: string,
  onSuccess?: () => void
): MutationResultPair<IKubeResponse<IHook>, KubeClientError, IPatchHookArgs, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  const { pollFasterAfterMutation } = usePollingContext();
  return useMockableMutation<IKubeResponse<IHook>, KubeClientError, IPatchHookArgs>(
    async ({ hookBeingEdited, hookFormInstance }) => {
      const updatedHook = generateHook(hookFormInstance, hookBeingEdited, planName);
      const hookResponse = await client.patch<IHook>(
        hookResource,
        (hookBeingEdited.metadata as IMetaObjectMeta).name,
        updatedHook
      );

      return hookResponse;
    },
    {
      onSuccess: () => {
        queryCache.invalidateQueries('hooks');
        pollFasterAfterMutation();
        onSuccess && onSuccess();
      },
    }
  );
};

// TODO we probably don't need the dedicated useDeleteHookMutation? only will patch as part of patching a plan
export const useDeleteHookMutation = (
  onSuccess?: () => void
): MutationResultPair<IKubeResponse<IKubeStatus>, KubeClientError, IHook, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  return useMockableMutation<IKubeResponse<IKubeStatus>, KubeClientError, IHook>(
    (hook: IHook) => client.delete(hookResource, (hook.metadata as IMetaObjectMeta).name),
    {
      onSuccess: () => {
        queryCache.invalidateQueries('hooks');
        onSuccess && onSuccess();
      },
    }
  );
};

export const playbookSchema = yup
  .string()
  .label('Ansible playbook')
  .test('valid-yaml', 'Playbook must be valid YAML', (value, context) => {
    try {
      yaml.load(value || '');
    } catch (e) {
      if (e.reason && e.mark) {
        return context.createError({
          message: `Invalid YAML: ${e.reason} (${e.mark.line + 1}:${e.mark.column + 1})`,
        });
      }
      return false;
    }
    return true;
  });
