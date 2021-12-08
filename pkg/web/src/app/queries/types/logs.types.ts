// import { LogType } from '@app/common/constants';
import { ICR, IMetaObjectMeta, INameNamespaceRef, IStatusCondition } from '@app/queries/types';

interface ILogMetadata extends IMetaObjectMeta {
  annotations?: {
    [key: string]: string | undefined;
  };
}

export interface ILogObject extends ICR {
  metadata: ILogMetadata;
  spec: {
    [key: string]: string | undefined;
    // type: LogType | null;
    // url?: string; // No url = host Log
    // secret?: INameNamespaceRef;
  };
  status?: {
    // conditions: IStatusCondition[];
  };
}
