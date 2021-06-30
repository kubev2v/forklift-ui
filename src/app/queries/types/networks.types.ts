export interface ISourceNetwork {
  id: string;
  name: string;
  selfLink: string;
}

export interface IOpenShiftNetwork {
  uid: string;
  namespace: string;
  name: string;
  selfLink: string;
  type?: 'pod';
}
