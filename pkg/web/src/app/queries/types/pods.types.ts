import { ICR } from '@app/queries/types';

export interface IPodObject extends ICR {
  spec: {
    containers: {
      name: string;
    }[];
  };
}

export type ContainerType = string;
