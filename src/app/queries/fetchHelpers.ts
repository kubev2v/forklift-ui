import { VIRT_META } from '@app/common/constants';
import { INetworkContext, useNetworkContext } from '@app/common/context/NetworkContext';
import { QueryFunction, MutateFunction } from 'react-query/types/core/types';
import { useHistory } from 'react-router-dom';
import { History, LocationState } from 'history';

interface IFetchContext {
  history: History<LocationState>;
  setSelfSignedCertUrl: INetworkContext['setSelfSignedCertUrl'];
}

export const useFetchContext = (): IFetchContext => ({
  history: useHistory(),
  setSelfSignedCertUrl: useNetworkContext().setSelfSignedCertUrl,
});

export const authorizedFetch = async <T>(url: string, fetchContext: IFetchContext): Promise<T> => {
  const { history, setSelfSignedCertUrl } = fetchContext;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${VIRT_META.oauth.clientSecret}`,
      },
    });
    if (response.ok && response.json) {
      return response.json();
    } else {
      return Promise.reject(response);
    }
  } catch (error) {
    // HACK: Doing our best to determine whether or not the
    // error was produced due to a self signed cert error.
    // It's an extremely barren object.
    if (error instanceof TypeError) {
      console.log('this is error', error);
      //TODO handle other CORS issues. commenting out for now

      // setSelfSignedCertUrl(url);
      // history.push('/cert-error');
    }
    return Promise.reject(error);
  }
};

export const authorizedPost = async <T, TData>(
  url: string,
  fetchContext: IFetchContext,
  data?: TData
): Promise<T> => {
  const { history, setSelfSignedCertUrl } = fetchContext;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${VIRT_META.oauth.clientSecret}`,
        body: JSON.stringify(data),
      },
    });
    if (response.ok && response.json) {
      return response.json();
    } else {
      return Promise.reject(response);
    }
  } catch (error) {
    // HACK: Doing our best to determine whether or not the
    // error was produced due to a self signed cert error.
    // It's an extremely barren object.
    if (error instanceof TypeError) {
      setSelfSignedCertUrl(url);
      history.push('/cert-error');
    }
    return Promise.reject(error);
  }
};

export const useAuthorizedFetch = <T>(url: string): QueryFunction<T> => {
  const fetchContext = useFetchContext();
  return () => authorizedFetch(url, fetchContext);
};

export const useAuthorizedMutate = <T, TData>(
  url: string,
  data: TData
): MutateFunction<T, TData> => {
  const fetchContext = useFetchContext();
  return () => authorizedPost(url, fetchContext, data);
};
