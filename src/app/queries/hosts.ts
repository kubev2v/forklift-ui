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
import { secretResource, ForkliftResource, ForkliftResourceKind } from '@app/client/helpers';
import { CLUSTER_API_VERSION, META } from '@app/common/constants';

export const hostConfigResource = new ForkliftResource(ForkliftResourceKind.Host, META.namespace);

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

const getHostConfigRef = (provider: IVMwareProvider, host: IHost) => ({
  name: `${provider.name}-${host.id}-config`,
  namespace: META.namespace,
});

const generateSecret = (
  values: SelectNetworkFormValues,
  secretBeingReusedRef: INameNamespaceRef | null,
  host: IHost,
  provider: IVMwareProvider,
  hostConfig?: IHostConfig
): INewSecret => ({
  apiVersion: 'v1',
  data: {
    user: values.adminUsername && btoa(values.adminUsername),
    password: values.adminPassword && btoa(values.adminPassword),
  },
  kind: 'Secret',
  metadata: {
    ...(secretBeingReusedRef || {
      generateName: `${provider.name}-${host.id}`,
      namespace: META.namespace,
    }),
    labels: {
      createdForResourceType: ForkliftResourceKind.Host,
      createdForResource: getHostConfigRef(provider, host).name,
    },
    ...(hostConfig
      ? {
          ownerReferences: [
            {
              apiVersion: hostConfig.apiVersion,
              kind: hostConfig.kind,
              name: hostConfig.metadata.name,
              uid: hostConfig.metadata.uid,
            },
          ],
        }
      : {}),
  },
  type: 'Opaque',
});

const generateHostConfig = (
  values: SelectNetworkFormValues,
  existingConfig: IHostConfig | null,
  host: IHost,
  provider: IVMwareProvider,
  secretRef: INameNamespaceRef | null
): IHostConfig => {
  const matchingNetworkAdapter = host.networkAdapters.find(
    ({ name }) => values.selectedNetworkAdapter?.name === name
  );
  return {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'Host',
    metadata: existingConfig?.metadata || getHostConfigRef(provider, host),
    spec: {
      id: host.id,
      ipAddress: matchingNetworkAdapter?.ipAddress || '',
      provider: nameAndNamespace(provider),
      secret: secretRef || null,
    },
  };
};

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
    // existingHostConfigs, secretResults and secretRefs arrays are indexed in the same order as selectedHosts
    const existingHostConfigs = getExistingHostConfigs(selectedHosts, allHostConfigs, provider);

    // Create or update secrets for each host
    const secretResults = await Promise.all(
      existingHostConfigs.map((hostConfig, index) => {
        const existingSecret = hostConfig?.spec.secret || null;
        const newSecret = generateSecret(values, existingSecret, selectedHosts[index], provider);
        if (existingSecret) {
          return client.patch<INewSecret>(secretResource, existingSecret.name, newSecret);
        }
        return client.create<INewSecret>(secretResource, newSecret);
      })
    );
    const secretRefs = secretResults.map((result) => nameAndNamespace(result.data.metadata));

    // Create or update host CRs
    const hostConfigResults = await Promise.all(
      selectedHosts.map((host, index) => {
        const existingConfig = existingHostConfigs[index] || null;
        const newConfig = generateHostConfig(
          values,
          existingConfig,
          host,
          provider,
          secretRefs[index]
        );
        if (existingConfig) {
          return client.patch<IHostConfig>(
            hostConfigResource,
            existingConfig.metadata.name,
            newConfig
          );
        }
        return client.create<IHostConfig>(hostConfigResource, newConfig);
      })
    );

    // Update secrets with hosts as ownerReferences
    await Promise.all(
      hostConfigResults.map((result, index) => {
        const hostConfig = result.data;
        const secretRef = hostConfig?.spec.secret || null;
        const updatedSecret = generateSecret(
          values,
          secretRef,
          selectedHosts[index],
          provider,
          hostConfig
        );
        return client.patch<INewSecret>(secretResource, secretRef?.name || '', updatedSecret);
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
