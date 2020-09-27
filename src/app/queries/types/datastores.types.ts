export interface IVMwareDatastore {
  id: string;
  parent: {
    Kind: string;
    ID: string;
  };
  name: string;
  selfLink: string;
  type: string;
  capacity: number;
  free: number;
  maintenance: string;
}
