import { UseQueryResult } from 'react-query';
import * as yup from 'yup';
import yaml from 'js-yaml';

import { ForkliftResource, ForkliftResourceKind } from '@app/client/helpers';
import { IKubeList } from '@app/client/types';
import { META } from '@app/common/constants';
import { usePollingContext } from '@app/common/context';
import {
  mockKubeList,
  sortKubeListByName,
  useMockableQuery,
} from './helpers';
import { MOCK_HOOKS } from './mocks/hooks.mock';
import { IHook } from './types';
import { useAuthorizedK8sClient } from './fetchHelpers';

const hookResource = new ForkliftResource(ForkliftResourceKind.Hook, META.namespace);

export const useHooksQuery = (): UseQueryResult<IKubeList<IHook>> => {
  const client = useAuthorizedK8sClient();
  const result = useMockableQuery<IKubeList<IHook>>(
    {
      queryKey: 'hooks',
      queryFn: async () => (await client.list<IKubeList<IHook>>(hookResource)).data,
      refetchInterval: usePollingContext().refetchInterval,
      select: sortKubeListByName
    },
    mockKubeList(MOCK_HOOKS, 'Hook')
  );
  return result;
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
