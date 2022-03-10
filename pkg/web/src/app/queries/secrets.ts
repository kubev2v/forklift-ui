import { secretResource } from '@app/client/helpers';
import { usePollingContext } from '@app/common/context';
import { UseQueryResult } from 'react-query';
import { useAuthorizedK8sClient } from './fetchHelpers';
import { useMockableQuery } from './helpers';
import { MOCK_SECRET } from './mocks/secrets.mock';
import { ISecret } from './types';

export const useSecretQuery = (secretName: string | null): UseQueryResult<ISecret> => {
  const client = useAuthorizedK8sClient();
  return useMockableQuery<ISecret>(
    {
      queryKey: ['secrets', secretName],
      queryFn: async () => (await client.get<ISecret>(secretResource, secretName || '')).data,
      refetchInterval: usePollingContext().refetchInterval,
      enabled: !!secretName,
    },
    MOCK_SECRET
  );
};
