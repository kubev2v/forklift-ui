import { MutationResultPair, QueryResult, useQueryCache } from 'react-query';
import { usePollingContext } from '@app/common/context';
import {
  useMockableQuery,
  getInventoryApiUrl,
  sortResultsByName,
  isSameResource,
  useMockableMutation,
} from './helpers';
import { MOCK_HOSTS } from './mocks/hosts.mock';
import { IHost, IHostConfig, IVMwareProvider } from './types';
import { useProvidersQuery } from '.';
import { useAuthorizedFetch, useAuthorizedK8sClient } from './fetchHelpers';
import { IKubeResponse, KubeClientError } from '@app/client/types';
import { SelectNetworkFormValues } from '@app/Providers/components/VMwareProviderHostsTable/SelectNetworkModal';

// TODO handle error messages? (query.status will correctly show 'error', but error messages aren't collected)
export const useHostsQuery = (providerName?: string): QueryResult<IHost[]> => {
  const { data: providers } = useProvidersQuery();
  const currentProvider = providers?.vsphere.find((provider) => provider.name === providerName);

  const result = useMockableQuery<IHost[]>(
    {
      queryKey: 'hosts',
      queryFn: useAuthorizedFetch(
        getInventoryApiUrl(`${currentProvider?.selfLink || ''}/hosts?detail=true`)
      ),
      config: {
        enabled: !!currentProvider,
        refetchInterval: usePollingContext().refetchInterval,
      },
    },
    MOCK_HOSTS
  );
  return sortResultsByName<IHost>(result);
};

const configMatchesHost = (config: IHostConfig, host: IHost, provider: IVMwareProvider) =>
  isSameResource(config.spec.provider, provider) && host.id === config.spec.id;

export const useConfigureHostsMutation = (
  provider: IVMwareProvider,
  selectedHosts: IHost[],
  allHostConfigs: IHostConfig[],
  onSuccess?: () => void
): MutationResultPair<
  IKubeResponse<IHostConfig>,
  KubeClientError,
  SelectNetworkFormValues,
  unknown
> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  const { pollFasterAfterMutation } = usePollingContext();

  const configureHosts = async (values: SelectNetworkFormValues) => {
    // TODO Use allHostConfigs to determine if each host needs to create or patch a host CR
    // TODO If reusing creds, don't pass any secrets for any of them (pass empty objects to remove secrets?)
    // TODO If not reusing creds, look for existing secrets:
    //   - if any exist, patch them all with the new creds and pass the first matching one to all CRs without a secret
    //   - else, create a new secret and pass it to all the host CRs.
    // Create or patch secrets
    // Create or patch Host CRs
    // - if any failed, and we created secrets for those, roll those back?

    const existingHostConfigs = selectedHosts.map((host) =>
      allHostConfigs.find((config) => configMatchesHost(config, host, provider))
    );
  };

  return useMockableMutation<IKubeResponse<IHostConfig>, KubeClientError, SelectNetworkFormValues>(
    configureHosts,
    {
      onSuccess: () => {
        queryCache.invalidateQueries('hosts');
        queryCache.invalidateQueries('hostconfigs');
        pollFasterAfterMutation();
        onSuccess && onSuccess();
      },
    }
  );
};
