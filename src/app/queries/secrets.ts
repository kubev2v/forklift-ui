import { secretResource } from '@app/client/helpers';
import { usePollingContext } from '@app/common/context';
import { QueryResult } from 'react-query';
import { useAuthorizedK8sClient } from './fetchHelpers';
import { useMockableQuery } from './helpers';
import { MOCK_SECRET } from './mocks/secrets.mock';
import { ISecret } from './types';

// TODO use this query in one of the forms to look up the associated secret
// TODO test it in remote mode to inspect the structure and create the mock data
// TODO figure out how to decode the secret data
// TODO adjust the form init to prefill secrets
// TODO get rid of the checkbox in the provider form
// TODO only prefill secrets on the host network form if exactly 1 host is selected

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
