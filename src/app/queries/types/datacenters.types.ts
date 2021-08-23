export interface IDataCenter {
  id: string;
  name: string;
  selfLink: string;
  revision: number;
}

export interface IOvirtDc extends IDataCenter {
  description: string;
  revision: number;
}

export interface IVSphereDc extends IDataCenter {
  description: string;
  parent: {
    kind: string;
    id: string;
  };
}
