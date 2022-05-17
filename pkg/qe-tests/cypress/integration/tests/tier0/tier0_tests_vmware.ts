import { ProviderVmware } from '../../models/providerVmware';
import { vmwareTier0TestArray } from './tier0_config_vmware';
import {
  cleanVms,
  createNamespace,
  deleteNamespace,
  login,
  ocApply,
  preservecookies,
  provisionNetwork,
  unprovisionNetwork,
} from '../../../utils/utils';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';
import { Plan } from '../../models/plan';
import { testData } from '../vmware/config_separate_mapping';
import { secondNetwork } from '../../types/constants';

vmwareTier0TestArray.forEach((currentTest) => {
  describe(
    'Tier0 tests, creating VMWare provider, network and storage(both ceph and nfs) mappings, ' +
      'plan (both cold and warm), running plan and deleting at the end',
    () => {
      const provider = new ProviderVmware();
      const networkMapping = new MappingNetwork();
      const storageMapping = new MappingStorage();
      const plan = new Plan();

      before(() => {
        createNamespace(currentTest.planData.namespace);
        provisionNetwork(currentTest.planData.namespace);
        // ocApply(secondNetwork, currentTest.planData.namespace);
      });

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
        cleanVms(currentTest.planData.vmList, namespace);
        unprovisionNetwork(namespace);
        deleteNamespace(namespace);
      });
    }
  );
});
