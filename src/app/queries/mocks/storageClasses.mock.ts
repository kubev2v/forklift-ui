import { IStorageClass } from '../types';

export let MOCK_STORAGE_CLASSES_BY_PROVIDER: { [key: string]: IStorageClass[] } = {};

// TODO put this condition back when we don't directly import mocks into components anymore
// if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
const exampleStorageClasses: IStorageClass[] = [
  {
    uid: 'foo-sc-uid-1',
    version: '1',
    namespace: 'foo',
    name: 'standard',
    selfLink: '/foo',
  },
  {
    uid: 'foo-sc-uid-2',
    version: '1',
    namespace: 'foo',
    name: 'large',
    selfLink: '/foo',
  },
  {
    uid: 'foo-sc-uid-3',
    version: '1',
    namespace: 'foo',
    name: 'small',
    selfLink: '/foo',
  },
];

MOCK_STORAGE_CLASSES_BY_PROVIDER = {
  OCPv_1: [...exampleStorageClasses],
  OCPv_2: [...exampleStorageClasses],
  OCPv_3: [...exampleStorageClasses],
};
//}
