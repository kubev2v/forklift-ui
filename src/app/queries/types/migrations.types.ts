import { ICR, INameNamespaceRef } from './common.types';
import { IPlanStatus } from './plans.types';

export interface IMigration extends ICR {
  apiVersion: string;
  kind: 'Migration';
  spec: {
    plan: INameNamespaceRef;
  };
  status?: IPlanStatus['migration'];
}
