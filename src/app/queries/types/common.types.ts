// TODO: lib-ui candidate
export interface IMetaTypeMeta {
  apiVersion: string;
  kind: string;
}

export interface IObjectReference {
  name: string;
  namespace: string;
  apiVersion?: string;
  fieldPath?: string;
  kind?: string;
  resourceVersion?: string;
  uid?: string;
}

// TODO: lib-ui candidate
export interface IMetaObjectMeta {
  name: string;
  namespace: string;
  selfLink?: string;
  uid?: string;
  resourceVersion?: string;
  generation?: number;
  creationTimestamp?: string; // ISO timestamp
  annotations?: {
    'kubectl.kubernetes.io/last-applied-configuration': string; // JSON
  };
  labels?: {
    createdForResourceType?: string;
    createdForResource?: string;
  };
  managedFields?: unknown[];
  ownerReferences?: IObjectReference[];
}

export interface IMetaObjectGenerateName extends Omit<IMetaObjectMeta, 'name'> {
  generateName: string;
}

export interface ICR extends IMetaTypeMeta {
  metadata: IMetaObjectMeta;
}

export interface IStatusCondition {
  category: string;
  type: string;
  status: 'True' | 'False';
  reason?: string;
  durable?: boolean;
  message: string;
  lastTransitionTime: string; // ISO timestamp
}

export interface IVMwareObjRef {
  kind: string;
  id: string;
}

export interface INameNamespaceRef {
  name: string;
  namespace: string;
}
