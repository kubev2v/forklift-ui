import { IMetaTypeMeta } from '@app/queries/types';
import { ClusterClient } from '@konveyor/lib-ui';
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

export type AuthorizedClusterClient = Pick<
  ClusterClient,
  'get' | 'list' | 'create' | 'delete' | 'patch' | 'put'
>;
