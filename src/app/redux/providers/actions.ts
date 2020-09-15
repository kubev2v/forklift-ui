import { createAction } from '@reduxjs/toolkit';
import { IMessage, SEND_MESSAGE, FETCH_PROVIDERS_REQUEST, IChatActionTypes } from './types';

export const fetchProvidersRequest = createAction(FETCH_PROVIDERS_REQUEST);

export function fetchProvidersRequest(): ICommonProvider[] {
  return {
    type: DELETE_MESSAGE,
    meta: {
      timestamp,
    },
  };
}
