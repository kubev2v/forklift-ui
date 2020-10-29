import { VIRT_META } from '@app/common/constants';
import { INetworkContext, useNetworkContext } from '@app/common/context/NetworkContext';
import { QueryFunction, MutateFunction } from 'react-query/types/core/types';
import { useHistory } from 'react-router-dom';
import { History, LocationState } from 'history';
import { useClientInstance } from '@app/client/helpers';
import { ClusterClient, KubeResource } from '@konveyor/lib-ui';

interface IFetchContext {
  history: History<LocationState>;
  setSelfSignedCertUrl: INetworkContext['setSelfSignedCertUrl'];
  checkExpiry: INetworkContext['checkExpiry'];
}

export const useFetchContext = (): IFetchContext => ({
  history: useHistory(),
  setSelfSignedCertUrl: useNetworkContext().setSelfSignedCertUrl,
  checkExpiry: useNetworkContext().checkExpiry,
});

export const authorizedFetch = async <T>(
  url: string,
  fetchContext: IFetchContext,
  extraHeaders: RequestInit['headers'] = {}
): Promise<T> => {
  const { history, setSelfSignedCertUrl, checkExpiry } = fetchContext;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${VIRT_META.oauth.clientSecret}`,
        ...extraHeaders,
      },
    });
    if (response.ok && response.json) {
      return response.json();
    } else {
      throw response;
    }
  } catch (error) {
    // HACK: Doing our best to determine whether or not the
    // error was produced due to a self signed cert error.
    // It's an extremely barren object.
    if (error instanceof TypeError) {
      console.log('this is error', error);
      //TODO handle other CORS issues.
      setSelfSignedCertUrl(url);
      history.push('/cert-error');
    }
    checkExpiry(error, history);
    throw error;
  }
};

export const authorizedK8sFetch = async <T>(
  resourceType: KubeResource,
  fetchContext: IFetchContext,
  client: ClusterClient
): Promise<T> => {
  const { history, setSelfSignedCertUrl, checkExpiry } = fetchContext;

  try {
    const response = await client.list(resourceType);

    if (response && response.data) {
      return response.data;
    } else {
      throw response;
    }
  } catch (error) {
    checkExpiry(error, history);

    const isAxiosSelfSignedCertError = (err) => {
      // HACK: Doing our best to determine whether or not the
      // error was produced due to a self signed cert error.
      // It's an extremely barren object.
      const e = err.toJSON();
      return !e.code && e.message === 'Network Error';
    };

    if (isAxiosSelfSignedCertError(error)) {
      const url = `${VIRT_META.clusterApi}/.well-known/oauth-authorization-server`;
      setSelfSignedCertUrl(url);
      history.push('/cert-error');
    }
    throw error;
  }
};

export const authorizedPost = async <T, TData>(
  url: string,
  fetchContext: IFetchContext,
  data?: TData
): Promise<T> => authorizedFetch(url, fetchContext, { body: JSON.stringify(data) });

export const useAuthorizedFetch = <T>(url: string): QueryFunction<T> => {
  const fetchContext = useFetchContext();
  return () => authorizedFetch(url, fetchContext);
};

export const useAuthorizedK8sFetch = <T>(resourceType: KubeResource): QueryFunction<T> => {
  const fetchContext = useFetchContext();
  const client = useClientInstance();
  return () => authorizedK8sFetch(resourceType, fetchContext, client);
};

export const useAuthorizedPost = <T, TData>(url: string, data: TData): MutateFunction<T, TData> => {
  const fetchContext = useFetchContext();
  return () => authorizedPost(url, fetchContext, data);
};
