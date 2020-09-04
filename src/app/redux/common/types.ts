export interface IMessage {
  user: string;
  message: string;
  timestamp: number;
}

export interface IChatState {
  messages: IMessage[];
}

export const SEND_MESSAGE = 'SEND_MESSAGE';
export const DELETE_MESSAGE = 'DELETE_MESSAGE';

interface ISendMessageAction {
  type: typeof SEND_MESSAGE;
  payload: IMessage;
}

interface IDeleteMessageAction {
  type: typeof DELETE_MESSAGE;
  meta: {
    timestamp: number;
  };
}

//TODO: Discuss how do we feel about union types/inferring types?
export type IChatActionTypes = ISendMessageAction | IDeleteMessageAction;
