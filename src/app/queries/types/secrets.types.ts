import { IMetaObjectGenerateName, IMetaTypeMeta } from '.';

export interface ISecret extends IMetaTypeMeta {
  data: {
    user?: string;
    password?: string;
    thumbprint?: string;
    token?: string;
  };
  metadata: IMetaObjectGenerateName;
  type: string;
}
