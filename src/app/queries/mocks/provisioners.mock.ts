import { IProvisioner } from '../types';

export let MOCK_PROVISIONERS: IProvisioner[] = [];

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  MOCK_PROVISIONERS = [
    {
      apiVersion: 'foo',
      kind: 'Provisioner',
      metadata: {
        name: 'prov-1',
        namespace: 'foo',
      },
      spec: {
        name: 'mock/prov-1',
      },
    },
    {
      apiVersion: 'foo',
      kind: 'Provisioner',
      metadata: {
        name: 'prov-2',
        namespace: 'foo',
      },
      spec: {
        name: 'mock/prov-2',
      },
    },
    {
      apiVersion: 'foo',
      kind: 'Provisioner',
      metadata: {
        name: 'prov-3',
        namespace: 'foo',
      },
      spec: {
        name: 'mock/prov-3',
      },
    },
  ];
}
