import { ProviderVmware } from '../../models/providerVmware';
import { vmwareTier0TestArray } from './tier0_config_vmware';
import { login } from '../../../utils/utils';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';
import { Plan } from '../../models/plan';
import { testData } from '../vmware/config_separate_mapping';

vmwareTier0TestArray.forEach((currentTest) => {
  describe(
    'Tier0 tests, creating VMWare provider, network and storage(both ceph and nfs) mappings, ' +
      'plan (both cold and warm), running plan and deleting at the end',
    () => {
      const provider = new ProviderVmware();
      const networkMapping = new MappingNetwork();
      const storageMapping = new MappingStorage();
      const plan = new Plan();
      // vmwareTier0TestArray.forEach((currentTest) => {
      beforeEach(() => {
        login(currentTest.loginData);
      });

      it('Login to MTV and create provider', () => {
        provider.create(currentTest.planData.providerData);
      });

      it('Create new network and storage mapping', () => {
        networkMapping.create(currentTest.planData.networkMappingData);
        storageMapping.create(currentTest.planData.storageMappingData);
      });

      it('Creating plan with existing network and storage mapping', () => {
        plan.create(currentTest.planData);
      });

      it('Running plan created in a previous tests', () => {
        plan.execute(currentTest.planData);
      });

      after('Deleting VMs, plan, mappings and provider created in a previous tests', () => {
        plan.delete(currentTest.planData);
        networkMapping.delete(currentTest.planData.networkMappingData);
        storageMapping.delete(currentTest.planData.storageMappingData);
        provider.delete(currentTest.planData.providerData);
        const namespace = currentTest.planData.namespace;
        const vm_list = currentTest.planData.vmList;
        vm_list.forEach((vm) => {
          cy.exec(`oc delete vm ${vm} -n${namespace}`);
        });
      });
    }
  );
});

describe('Automate cancel and restart of cold migration test', () => {
  const sourceProvider = new ProviderVmware();
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();
  const plan = new Plan();

  beforeEach(() => {
    login(testData.loginData);
    sourceProvider.create(testData.planData.providerData);
    networkMapping.create(testData.planData.networkMappingData);
    storageMapping.create(testData.planData.storageMappingData);
    plan.create(testData.planData);
  });

  it('Cancel and restart migration', () => {
    plan.cancel_and_restart(testData.planData);
  });

  afterEach(() => {
    plan.delete(testData.planData);
    networkMapping.delete(testData.planData.networkMappingData);
    storageMapping.delete(testData.planData.storageMappingData);
    sourceProvider.delete(testData.planData.providerData);
    const namespace = testData.planData.namespace;
    const vm_list = testData.planData.vmList;
    vm_list.forEach((vm) => {
      cy.exec(`oc delete vm ${vm} -n${namespace}`);
    });
  });
});
