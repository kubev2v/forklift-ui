import { IMetaTypeMeta } from '@app/queries/types';
import { AxiosError } from 'axios';

export type KubeClientError = AxiosError<{ message: string }>;

export interface IKubeList<T> extends IMetaTypeMeta {
  items: T[];
  metadata: {
    continue: string;
    resourceVersion: string;
    selfLink: string;
  };
}
