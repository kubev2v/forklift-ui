import { MutationResultPair, QueryResult, useQueryCache } from 'react-query';
import { usePollingContext } from '@app/common/context';
import {
  useMockableQuery,
  getInventoryApiUrl,
  sortResultsByName,
  isSameResource,
  useMockableMutation,
  nameAndNamespace,
  mockKubeList,
} from './helpers';
import { MOCK_HOSTS, MOCK_HOST_CONFIGS } from './mocks/hosts.mock';
import { IHost, IHostConfig, INameNamespaceRef, INewSecret, IVMwareProvider } from './types';
import { useAuthorizedFetch, useAuthorizedK8sClient } from './fetchHelpers';
import { IKubeList, IKubeResponse, KubeClientError } from '@app/client/types';
import { SelectNetworkFormValues } from '@app/Providers/components/VMwareProviderHostsTable/SelectNetworkModal';
import { secretResource, VirtResource, VirtResourceKind } from '@app/client/helpers';
import { CLUSTER_API_VERSION, VIRT_META } from '@app/common/constants';

export const hostConfigResource = new VirtResource(VirtResourceKind.Host, VIRT_META.namespace);

// TODO handle error messages? (query.status will correctly show 'error', but error messages aren't collected)
export const useHostsQuery = (provider: IVMwareProvider | null): QueryResult<IHost[]> => {
  const result = useMockableQuery<IHost[]>(
    {
      queryKey: 'hosts',
      queryFn: useAuthorizedFetch(
        getInventoryApiUrl(`${provider?.selfLink || ''}/hosts?detail=true`)
      ),
      config: {
        enabled: !!provider,
        refetchInterval: usePollingContext().refetchInterval,
      },
    },
    MOCK_HOSTS
  );
  return sortResultsByName<IHost>(result);
};

export const useHostConfigsQuery = (): QueryResult<IKubeList<IHostConfig>> => {
  const client = useAuthorizedK8sClient();
  return useMockableQuery<IKubeList<IHostConfig>>(
    {
      queryKey: 'host-configs',
      queryFn: async () => (await client.list<IKubeList<IHostConfig>>(hostConfigResource)).data,
      config: {
        refetchInterval: usePollingContext().refetchInterval,
      },
    },
    mockKubeList(MOCK_HOST_CONFIGS, 'Host')
  );
};

export const configMatchesHost = (
  config: IHostConfig,
  host: IHost,
  provider: IVMwareProvider
): boolean => isSameResource(config.spec.provider, provider) && host.id === config.spec.id;

export const getExistingHostConfigs = (
  selectedHosts: IHost[],
  allHostConfigs: IHostConfig[],
  provider: IVMwareProvider
): (IHostConfig | undefined)[] =>
  selectedHosts.map((host) =>
    allHostConfigs.find((config) => configMatchesHost(config, host, provider))
  );

const generateSecret = (
  values: SelectNetworkFormValues,
  secretBeingReusedRef: INameNamespaceRef | null,
  provider: IVMwareProvider
): INewSecret => ({
  apiVersion: 'v1',
  data: {
    user: values.adminUsername && btoa(values.adminUsername),
    password: values.adminPassword && btoa(values.adminPassword),
  },
  kind: 'Secret',
  metadata: {
    ...(secretBeingReusedRef || {
      generateName: `${provider.name}-`,
      namespace: VIRT_META.namespace,
    }),
    labels: {
      createdForResourceType: VirtResourceKind.Provider,
      createdForResource: provider.name,
    },
  },
  type: 'Opaque',
});

const generateHostConfig = (
  values: SelectNetworkFormValues,
  existingConfig: IHostConfig | null,
  host: IHost,
  provider: IVMwareProvider,
  secretRef: INameNamespaceRef | null
): IHostConfig => ({
  apiVersion: CLUSTER_API_VERSION,
  kind: 'Host',
  metadata: existingConfig?.metadata || {
    name: `host-${host.id}-config`,
    namespace: VIRT_META.namespace,
  },
  spec: {
    id: host.id,
    ipAddress: values.selectedNetworkAdapter?.ipAddress || '',
    provider: nameAndNamespace(provider),
    secret: secretRef || null,
  },
});

export const useConfigureHostsMutation = (
  provider: IVMwareProvider,
  selectedHosts: IHost[],
  allHostConfigs: IHostConfig[],
  onSuccess?: () => void
): MutationResultPair<
  IKubeResponse<IHostConfig>[],
  KubeClientError,
  SelectNetworkFormValues,
  unknown
> => {
  const client = useAuthorizedK8sClient();
  const queryCache = useQueryCache();
  const { pollFasterAfterMutation } = usePollingContext();

  const configureHosts = async (values: SelectNetworkFormValues) => {
    const existingHostConfigs = getExistingHostConfigs(selectedHosts, allHostConfigs, provider);
    let secretRef: INameNamespaceRef | null = null;
    if (!values.isReusingCredentials) {
      // If none of these hosts are configured with a secret, creates a new one.
      // Else, patches the first available secret and reuses it for all hosts.
      const existingSecrets = existingHostConfigs
        .map((hostConfig) => hostConfig?.spec.secret)
        .filter((secret) => secret?.name && secret?.namespace) as INameNamespaceRef[];
      const secretBeingReusedRef = existingSecrets.length > 0 ? existingSecrets[0] : null;
      const newSecret = generateSecret(values, secretBeingReusedRef, provider);
      let secretResult: IKubeResponse<INewSecret>;
      if (secretBeingReusedRef) {
        secretResult = await client.patch(secretResource, secretBeingReusedRef.name, newSecret);
        secretRef = secretBeingReusedRef;
      } else {
        secretResult = await client.create(secretResource, newSecret);
        secretRef = nameAndNamespace(secretResult.data.metadata);
      }
    }
    const hostConfigResults = await Promise.all(
      selectedHosts.map(async (host, index) => {
        const existingConfig = existingHostConfigs[index] || null;
        const newConfig = generateHostConfig(values, existingConfig, host, provider, secretRef);
        if (existingConfig) {
          return await client.patch<IHostConfig>(
            hostConfigResource,
            existingConfig.metadata.name,
            newConfig
          );
        } else {
          return await client.create<IHostConfig>(hostConfigResource, newConfig);
        }
      })
    );
    return hostConfigResults;
  };

  return useMockableMutation<
    IKubeResponse<IHostConfig>[],
    KubeClientError,
    SelectNetworkFormValues
  >(configureHosts, {
    onSuccess: () => {
      queryCache.invalidateQueries('hosts');
      queryCache.invalidateQueries('hostconfigs');
      pollFasterAfterMutation();
      onSuccess && onSuccess();
    },
  });
};
