import { MutationResultPair, QueryResult, useQueryCache } from 'react-query';
import * as yup from 'yup';

import { checkIfResourceExists, ForkliftResource, ForkliftResourceKind } from '@app/client/helpers';
import { IKubeList, IKubeResponse, IKubeStatus, KubeClientError } from '@app/client/types';
import { dnsLabelNameSchema, META } from '@app/common/constants';
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
import { HookFormState } from '@app/Hooks/components/AddEditHookModal';
import { generateHook } from '@app/Hooks/components/helpers';

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

export const useCreateHookMutation = (
  onSuccess?: () => void
): MutationResultPair<IKubeResponse<IHook>, KubeClientError, HookFormState, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  const { pollFasterAfterMutation } = usePollingContext();
  return useMockableMutation<IKubeResponse<IHook>, KubeClientError, HookFormState>(
    async (form) => {
      await checkIfResourceExists(
        client,
        ForkliftResourceKind.Hook,
        hookResource,
        form.values.name
      );

      const hookResponse = await client.create<IHook>(hookResource, generateHook(form));
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
  form: HookFormState;
}

export const usePatchHookMutation = (
  onSuccess?: () => void
): MutationResultPair<IKubeResponse<IHook>, KubeClientError, IPatchHookArgs, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  const { pollFasterAfterMutation } = usePollingContext();
  return useMockableMutation<IKubeResponse<IHook>, KubeClientError, IPatchHookArgs>(
    async ({ hookBeingEdited, form }) => {
      const updatedHook = generateHook(form);
      const hookResponse = await client.patch<IHook>(
        hookResource,
        hookBeingEdited.metadata.name,
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

export const useDeleteHookMutation = (
  onSuccess?: () => void
): MutationResultPair<IKubeResponse<IKubeStatus>, KubeClientError, IHook, unknown> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  return useMockableMutation<IKubeResponse<IKubeStatus>, KubeClientError, IHook>(
    (hook: IHook) => client.delete(hookResource, hook.metadata.name),
    {
      onSuccess: () => {
        queryCache.invalidateQueries('hooks');
        onSuccess && onSuccess();
      },
    }
  );
};

export const getHookNameSchema = (
  hooksQuery: QueryResult<IKubeList<IHook>>,
  editingHookName: string | null
): yup.StringSchema =>
  dnsLabelNameSchema.test('unique-name', 'A hook with this name already exists', (value) => {
    if (editingHookName && editingHookName === value) return true;
    if (
      hooksQuery.data?.items.find(
        (hook) => hook && (hook.metadata as IMetaObjectMeta).name === value
      )
    )
      return false;
    return true;
  });

// TODO add the shared annotation explicitly to IHook and check logic for shared/private hooks everywhere
export const filterSharedHooks = (hooks?: IHook[]): IHook[] =>
  (hooks || []).filter(
    (hook) => hook.metadata.annotations?.['forklift.konveyor.io/shared'] !== 'false'
  ) || null;
