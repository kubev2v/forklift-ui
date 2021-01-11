import { ICR } from '.';

export interface IProvisioner extends ICR {
  spec: {
    name: string;
  };
}
