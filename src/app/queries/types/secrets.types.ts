import { IMetaObjectGenerateName, IMetaTypeMeta, IMetaObjectMeta } from './common.types';

export interface ISecret extends IMetaTypeMeta {
  data: {
    user?: string;
    password?: string;
    thumbprint?: string;
    token?: string;
  };
  metadata: IMetaObjectGenerateName | IMetaObjectMeta;
  type: string;
}
