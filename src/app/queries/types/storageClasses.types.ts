export interface IStorageClass {
  uid: string;
  version: string;
  namespace: string;
  name: string;
  selfLink: string;
}

export interface IStorageClassesByProvider {
  [providerName: string]: IStorageClass[];
}
