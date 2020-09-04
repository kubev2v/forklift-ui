import { IChatState, IChatActionTypes, SEND_MESSAGE, DELETE_MESSAGE } from './types';

const initialState: IChatState = {
  messages: [],
};

export default function commonReducer(state = initialState, action: IChatActionTypes): IChatState {
  switch (action.type) {
    case SEND_MESSAGE:
      return {
        messages: [...state.messages, action.payload],
      };
    case DELETE_MESSAGE:
      return {
        messages: state.messages.filter((message) => message.timestamp !== action.meta.timestamp),
      };
    default:
      return state;
  }
}
