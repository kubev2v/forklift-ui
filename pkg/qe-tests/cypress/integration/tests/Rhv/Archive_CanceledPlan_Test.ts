import { login } from '../../../utils/utils';
import { Plan } from '../../models/plan';
import { testData } from './config_separate_mapping_rhv';
import { providerRhv } from '../../models/providerRhv';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';

describe('Automate archive migration plan test', () => {
  const source = new providerRhv();
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();
  const plan = new Plan();

  beforeEach(() => {
    login(testData.loginData);
  });

  it('Create a provider, mappings, plan and cancel plan', () => {
    source.create(testData.planData.providerData);
    networkMapping.create(testData.planData.networkMappingData);
    storageMapping.create(testData.planData.storageMappingData);
    plan.create(testData.planData);
    plan.cancel_plan(testData.planData);
  });

  it('Archiving plan', () => {
    plan.archive(testData.planData);
  });

  it('Delete Duplicated Plan', () => {
    plan.delete(testData.planData);
  });

  it('Deleting Archived plan', () => {
    plan.deleteArchive(testData.planData);
  });

  after(() => {
    networkMapping.delete(testData.planData.networkMappingData);
    storageMapping.delete(testData.planData.storageMappingData);
    source.delete(testData.planData.providerData);
  });
});
