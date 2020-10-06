import { VIRT_META } from '@app/common/constants';
import { INetworkContext, useNetworkContext } from '@app/common/context/NetworkContext';
import { QueryFunction } from 'react-query/types/core/types';
import { useHistory } from 'react-router-dom';
import { History, LocationState } from 'history';

interface HttpResponse<T> extends Response {
  parsedBody?: T;
}

export const isSelfSignedCertError = <T>(response: HttpResponse<T>): boolean => {
  // HACK: Doing our best to determine whether or not the
  // error was produced due to a self signed cert error.
  // It's an extremely barren object.
  const certErrorText = 'Failed to fetch';
  return response instanceof TypeError && response.message === certErrorText;
};

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

  const handleFetchResponse = (response: HttpResponse<T>) => {
    if (isSelfSignedCertError(response)) {
      setSelfSignedCertUrl(url);
      history.push(`/cert-error`);
    }
    if (response.ok && response.json) {
      return response.json();
    } else {
      return response; // or maybe something that pulls out the error message? we can figure that out later
    }
  };

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${VIRT_META.oauth.clientSecret}`,
    },
  });
  return handleFetchResponse(response);
};

export const useAuthorizedFetch = <T>(url: string): QueryFunction<T> => {
  const fetchContext = useFetchContext();
  return () => authorizedFetch(url, fetchContext);
};
