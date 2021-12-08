import { ICR, IMetaObjectMeta, INameNamespaceRef, IStatusCondition } from '@app/queries/types';

interface IPodMetadata extends IMetaObjectMeta {
  annotations?: {
    [key: string]: string | undefined;
  };
}

export interface IPodObject extends ICR {
  metadata: IPodMetadata;
  spec: {
    [key: string]: string | undefined;
    // type: PodType | null;
    // url?: string; // No url = host Pod
    // secret?: INameNamespaceRef;
  };
  status?: {
    // conditions: IStatusCondition[];
  };
}
