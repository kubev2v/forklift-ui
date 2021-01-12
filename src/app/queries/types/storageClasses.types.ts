export interface IStorageClass {
  uid: string;
  version: string;
  namespace: string;
  name: string;
  selfLink: string;
  object: {
    provisioner?: string;
    metadata: {
      annotations?: {
        'storageclass.kubernetes.io/is-default-class'?: 'true' | 'false';
      };
    };
  };
}

export interface IAnnotatedStorageClass extends IStorageClass {
  uiMeta: {
    isDefault: boolean;
    isCompatible: boolean;
  };
}
