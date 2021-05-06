import { ICR } from './common.types';

export interface IHook extends ICR {
  apiVersion: string;
  kind: string;
  spec: {
    url: string;
    branch: string;
  };
}
