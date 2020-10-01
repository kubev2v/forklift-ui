import { useOAuthContext } from '@app/common/context';
import { QueryFunction } from 'react-query/types/core/types';
import { useHistory } from 'react-router-dom';

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

export const useFetch = <T>(url: string): QueryFunction<T> => {
  const history = useHistory();

  const { setFailedUrl, migMeta } = useOAuthContext();

  const handleFetchResponse = (response: HttpResponse<T>) => {
    if (isSelfSignedCertError(response)) {
      setFailedUrl(url);
      history.push(`/cert-error`);
    }
    return response.ok && response.json && response.json();
  };

  //TODO: add real oauth token fetch here
  const fetchData = () => {
    return fetch(url, {
      //TODO: add token here when we fetch from oauth server
      // const myToken = 'fjdslafjdlksajflkj';
      //   credentials: 'include'
      // mode: 'cors',
      // credentials: 'include',
      headers: {
        Authorization: `Bearer ${migMeta.oauth.clientSecret}`,
      },
    })
      .then(handleFetchResponse)
      .catch(handleFetchResponse);
  };

  return fetchData;
};
