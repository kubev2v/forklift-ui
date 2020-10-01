import { useOAuthContext } from '@app/common/context';
import { QueryFunction } from 'react-query/types/core/types';
import { useHistory } from 'react-router-dom';

export const useFetch = <T>(url: string): QueryFunction<T> => {
  const history = useHistory();

  const { setFailedUrl } = useOAuthContext();

  const handleFetchResponse = (response) => {
    const certErrorText = 'Failed to fetch';
    if (response instanceof TypeError && response.message === certErrorText) {
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
      // headers: {
      //   'Content-Type': 'application/json',
      //   Authorization: `Bearer ${myToken}`,
      // 'Content-Type': 'application/x-www-form-urlencoded',
      // },
    })
      .then(handleFetchResponse)
      .catch(handleFetchResponse);
  };

  return fetchData;
};
