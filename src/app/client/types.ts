import { AxiosError } from 'axios';

export type KubeClientError = AxiosError<{ message: string }>;

export interface IKubeList<T> {
  apiVersion: string;
  items: T[];
  kind: string;
  metadata: {
    continue: string;
    resourceVersion: string;
    selfLink: string;
  };
}
