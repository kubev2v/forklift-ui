import { ICR, INameNamespaceRef } from './common.types';
import { IPlanStatus } from './plans.types';

export interface ICanceledVM {
  id: string;
  name: string;
  type: 'vsphere';
}

export interface IMigration extends ICR {
  apiVersion: string;
  kind: 'Migration';
  spec: {
    plan: INameNamespaceRef;
    cancel?: ICanceledVM[];
  };
  status?: IPlanStatus['migration'];
}
