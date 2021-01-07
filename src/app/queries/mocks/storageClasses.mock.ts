import { IAnnotatedStorageClass, IByProvider } from '../types';

export let MOCK_STORAGE_CLASSES_BY_PROVIDER: IByProvider<IAnnotatedStorageClass> = {};

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  const exampleStorageClasses: IAnnotatedStorageClass[] = [
    {
      uid: 'foo-sc-uid-1',
      version: '1',
      namespace: 'foo',
      name: 'standard',
      selfLink: '/foo/sc/1',
      uiMeta: {
        isCompatible: true,
        isDefault: true,
      },
      object: {
        provisioner: 'mock/prov-1',
        metadata: {
          annotations: {
            'storageclass.kubernetes.io/is-default-class': 'true',
          },
        },
      },
    },
    {
      uid: 'foo-sc-uid-2',
      version: '1',
      namespace: 'foo',
      name: 'large',
      selfLink: '/foo/sc/2',
      uiMeta: {
        isCompatible: false,
        isDefault: false,
      },
      object: {
        provisioner: 'missing-prov!',
        metadata: {},
      },
    },
    {
      uid: 'foo-sc-uid-3',
      version: '1',
      namespace: 'foo',
      name: 'small',
      selfLink: '/foo/sc/3',
      uiMeta: {
        isCompatible: true,
        isDefault: false,
      },
      object: {
        provisioner: 'mock/prov-2',
        metadata: {},
      },
    },
  ];

  MOCK_STORAGE_CLASSES_BY_PROVIDER = {
    'ocpv-1': [...exampleStorageClasses],
    'ocpv-2': [...exampleStorageClasses],
    'ocpv-3': [...exampleStorageClasses],
  };
}
