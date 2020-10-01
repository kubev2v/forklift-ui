import { VIRT_META } from '@app/common/constants';
import { useAppContext } from '@app/common/context/AppContext';
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

  const { setSelfSignedCertUrl } = useAppContext();

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

  const fetchData = () => {
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${VIRT_META.oauth.clientSecret}`,
      },
    }).then(handleFetchResponse);
  };

  return fetchData;
};
