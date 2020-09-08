import { createAction } from '@reduxjs/toolkit';
import { IMessage, SEND_MESSAGE, DELETE_MESSAGE, IChatActionTypes } from './types';

// TypeScript infers that this function is returning SendMessageAction
// export function sendMessage(newMessage: IMessage): IChatActionTypes {
//   return {
//     type: SEND_MESSAGE,
//     payload: newMessage,
//   };
// }

export const sendMessage = createAction(SEND_MESSAGE);

// TypeScript infers that this function is returning DeleteMessageAction
export function deleteMessage(timestamp: number): IChatActionTypes {
  return {
    type: DELETE_MESSAGE,
    meta: {
      timestamp,
    },
  };
}
