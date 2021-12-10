import { ICR, IMetaObjectMeta, INameNamespaceRef, IStatusCondition } from '@app/queries/types';

// interface IPodListMetadata extends IMetaObjectMeta {
//   annotations?: {
//     [key: string]: string | undefined;
//   };
// }

export interface IPodObject extends ICR {
  // metadata: IPodListMetadata;
  spec: {
    containers: {
      name: string;
      // [key: string]: string | undefined;
    }[];
    // type: PodType | null;
    // url?: string; // No url = host Pod
    // secret?: INameNamespaceRef;
  };
  // status?: {
  //   // conditions: IStatusCondition[];
  // };
}

// export type ContainerType = 'main' | 'controller' | 'inventory';
export type ContainerType = string;

// export enum PodContainerType {
//   Main = 'main',
//   Controller = 'controller',
//   Inventory = 'inventory'
// }
