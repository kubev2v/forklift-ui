import {
  MutationResult,
  queryCache,
  QueryResult,
  useMutation,
  MutationResultPair,
  MutationFunction,
} from 'react-query';
import KubeClient, { ClientFactory, NamespacedResource } from '@konveyor/lib-ui/dist/';

import { usePollingContext, useNetworkContext } from '@app/common/context';
import { POLLING_INTERVAL } from './constants';
import { useMockableQuery, getApiUrl, sortIndexedResultsByName } from './helpers';
import { MOCK_PROVIDERS } from './mocks/providers.mock';
import { IProvidersByType, Provider, IVMwareProvider, ICommonProvider } from './types';
import { useAuthorizedFetch, useAuthorizedMutate } from './fetchHelpers';
import { ProviderType, VIRT_META } from '@app/common/constants';

// import { ClientFactory } from '../../../client/client_factory';
// TODO handle error messages? (query.status will correctly show 'error', but error messages aren't collected)
export const useProvidersQuery = (): QueryResult<IProvidersByType> => {
  const result = useMockableQuery<IProvidersByType>(
    {
      queryKey: 'providers',
      queryFn: useAuthorizedFetch(getApiUrl('/providers?detail=true')),
      config: { refetchInterval: usePollingContext().isPollingEnabled ? POLLING_INTERVAL : false },
    },
    MOCK_PROVIDERS
  );

  return sortIndexedResultsByName<Provider, IProvidersByType>(result);
};
interface IProviderValues {
  type: string;
  name: string;
}
interface IProviderResult {
  test?: any;
}
export class VirtResource extends NamespacedResource {
  private _gvk: KubeClient.IGroupVersionKindPlural;
  constructor(kind: VirtResourceKind, namespace: string) {
    super(namespace);

    this._gvk = {
      group: 'virt.konveyor.io',
      version: 'v1alpha1',
      kindPlural: kind,
    };
  }
  gvk(): KubeClient.IGroupVersionKindPlural {
    return this._gvk;
  }
}
export enum VirtResourceKind {
  Provider = 'providers',
}

export const useCreateProvider = () => {
  const { currentUser } = useNetworkContext();
  // const client: IClusterClient = ClientFactory.cluster(state);

  const useProviderPost = async (values: IProviderValues) => {
    try {
      // const vmwareProvider1: IVMwareProvider = {
      const vmwareProvider1: any = {
        apiVersion: 'virt.konveyor.io/v1alpha1',
        namespace: 'openshift-migration',
        name: 'VCenter1',
        type: ProviderType.vsphere,
        spec: {
          type: ProviderType.vsphere,
          url: 'vcenter.v2v.bos.redhat.com',
          secret: {
            namespace: 'openshift-migration',
            name: 'boston',
          },
        },
      };
      // const response = await fetch(getClusterApiUrl(`/providers/${values.type}`), {
      const currentUserString = currentUser !== null ? JSON.parse(currentUser || '{}') : {};

      const user = {
        access_token: currentUserString.access_token,
        expiry_time: currentUserString.expiry_time,
      };
      const client = ClientFactory.cluster(user, VIRT_META.clusterApi);
      client.create(
        new VirtResource(VirtResourceKind.Provider, VIRT_META.namespace),
        vmwareProvider1
      );

      // const client: any = ClientFactory.cluster(user, getClusterApiUrl('/provider/namedfsf'));
      // const response = await fetch(getClusterApiUrl(`/providers`), {
      //   // mode: 'no-cors',
      //   method: 'POST',
      //   headers: {
      //     Accept: 'application/json',
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${currentUser}`,
      //     body: JSON.stringify(vmwareProvider1),
      //     // body: JSON.stringify(values),
      //   },
      // });
      // if (response.ok && response.json) {
      //   return response.json();
      // } else {
      //   return Promise.reject(response);
      // }
    } catch (error) {
      console.error('Failed to add provider.');
      return Promise.reject(error);
    }
  };

  const [mutate] = useMutation(useProviderPost);

  // return useAuthorizedMutate('url', 'data');
  const createProvider = async (values: IProviderValues) => {
    // Prevent the form from refreshing the page

    try {
      await mutate(values);
      // Todo was successfully created
    } catch (error) {
      // Uh oh, something went wrong
    }
  };
  return {
    createProvider,
  };
};

export const useHasSufficientProvidersQuery = (): {
  isLoading: boolean;
  isError: boolean;
  hasSufficientProviders: boolean | undefined;
} => {
  const result = useProvidersQuery();
  const vmwareProviders = result.data?.vsphere || [];
  const openshiftProviders = result.data?.openshift || [];
  const hasSufficientProviders = result.data
    ? vmwareProviders.length >= 1 && openshiftProviders.length >= 1
    : undefined;
  return {
    isLoading: result.isLoading,
    isError: result.isError,
    hasSufficientProviders,
  };
};
