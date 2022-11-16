import { login } from '../../../utils/utils';
import { Plan } from '../../models/plan';
import { testrhel8Cold } from './config_separate_mapping_rhv';
import { ProviderRhv } from '../../models/providerRhv';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';

describe('Automate archive migration plan test', () => {
  const source = new ProviderRhv();
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();
  const plan = new Plan();

  beforeEach(() => {
    login(testrhel8Cold.loginData);
  });

  it('Create a provider, mappings, plan and succeeded plan', () => {
    source.create(testrhel8Cold.planData.providerData);
    networkMapping.create(testrhel8Cold.planData.networkMappingData);
    storageMapping.create(testrhel8Cold.planData.storageMappingData);
    plan.create(testrhel8Cold.planData);
    plan.execute(testrhel8Cold.planData);
  });

  it('Archiving plan', () => {
    plan.archive(testrhel8Cold.planData);
  });
  it('Delete Duplicated Plan', () => {
    plan.delete(testrhel8Cold.planData);
  });

  it('Deleting Archived plan', () => {
    plan.deleteArchive(testrhel8Cold.planData);
  });

  after(() => {
    networkMapping.delete(testrhel8Cold.planData.networkMappingData);
    storageMapping.delete(testrhel8Cold.planData.storageMappingData);
    source.delete(testrhel8Cold.planData.providerData);
  });
});
