import { IMetaTypeMeta, IObjectReference } from '.';

export interface ISecret extends IMetaTypeMeta {
  data: {
    user?: string;
    password?: string;
    thumbprint?: string;
    token?: string;
  };
  metadata: {
    name?: string;
    generateName?: string;
    namespace: string;
    labels: {
      createdForResourceType: string;
      createdForResource: string;
    };
    ownerReferences?: IObjectReference[];
  };
  type: string;
}
