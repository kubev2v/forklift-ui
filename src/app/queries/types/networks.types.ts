export interface IVMwareNetwork {
  id: string;
  parent: {
    Kind: string;
    ID: string;
  };
  name: string;
  selfLink: string;
}

export interface IOpenShiftNetwork {
  uid: string;
  version: string;
  namespace: string;
  name: string;
  selfLink: string;
  // There's more if we load with ?detail=true
}
