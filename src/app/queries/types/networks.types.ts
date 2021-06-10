export interface ISourceNetwork {
  id: string;
  name: string;
  selfLink: string;
}

export interface IOpenShiftNetwork {
  uid: string;
  version: string;
  namespace: string;
  name: string;
  selfLink: string;
  type?: 'pod';
  // There's more if we load with ?detail=1
}
