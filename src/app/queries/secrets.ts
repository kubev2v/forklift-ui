import { secretResource } from '@app/client/helpers';
import { usePollingContext } from '@app/common/context';
import { QueryResult } from 'react-query';
import { useAuthorizedK8sClient } from './fetchHelpers';
import { useMockableQuery } from './helpers';
import { MOCK_SECRET } from './mocks/secrets.mock';
import { ISecret } from './types';

export const useSecretQuery = (secretName: string | null): QueryResult<ISecret> => {
  const client = useAuthorizedK8sClient();
  return useMockableQuery<ISecret>(
    {
      queryKey: ['secret', secretName],
      queryFn: async () => (await client.get<ISecret>(secretResource, secretName || '')).data,
      config: {
        refetchInterval: usePollingContext().refetchInterval,
        enabled: !!secretName,
      },
    },
    MOCK_SECRET
  );
};
