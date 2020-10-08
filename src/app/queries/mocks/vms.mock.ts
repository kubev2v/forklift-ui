import { IVM } from '../types/plans.types';

export let MOCK_VMS: IVM[] = [];

// TODO this might not be necessary at all, since we can use the tree leaf nodes instead...
// TODO remove this?

// TODO put this condition back when we don't directly import mocks into components anymore
//if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {

export const vm1: IVM = {
  name: 'vm1',
  datacenter: 'Prod center 1',
  cluster: 'Cluster 1',
  host: 'host test1',
  folderPath: 'folder1/folderb',
  migrationAnalysis: 'Ok',
  analysisDescription: 'No risk assessed',
};

export const vm2: IVM = {
  name: 'vm2',
  datacenter: 'Prod center 1',
  cluster: 'Cluster 1',
  host: 'host test1',
  folderPath: 'folder2/foldera',
  migrationAnalysis: 'Warning',
  analysisDescription: 'There is a risk because...',
};

MOCK_VMS = [vm1, vm2];
