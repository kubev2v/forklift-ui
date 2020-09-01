// TODO: lib-ui candidate
export interface MetaTypeMeta {
  apiVersion: string;
  kind: string;
}

// TODO: lib-ui candidate
export interface MetaObjectMeta {
  name: string;
  namespace: string;
  selfLink: string;
  uid: string;
  resourceVersion: string;
  generation: number;
  creationTimestamp: string; // ISO timestamp
  annotations?: {
    'kubectl.kubernetes.io/last-applied-configuration': string; // JSON
  };
}

export interface CR extends MetaTypeMeta {
  metadata: MetaObjectMeta;
}
