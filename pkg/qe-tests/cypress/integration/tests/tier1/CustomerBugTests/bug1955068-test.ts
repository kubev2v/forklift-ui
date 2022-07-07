/*
Description of problem:
On an external OCP cluster, installed with MTV beta,
VMware VMs are not displayed with this error:

"Error loading VMware tree data
500: internal Server Error"

https://bugzilla.redhat.com/show_bug.cgi?id=1955068
 */
import { ProviderVmware } from '../../../models/providerVmware';
import { testData } from './bug1955068-config';
import { cleanUp, login, moveVmwareFolder } from '../../../../utils/utils';
import { Plan } from '../../../models/plan';
import { MappingNetwork } from '../../../models/mappingNetwork';
import { MappingStorage } from '../../../models/mappingStorage';

describe('End to End test, creating provider, mapping, plan, running plan and deleting at the end', () => {
  const provider = new ProviderVmware();
  const networkMapping = new MappingNetwork();
  const storageMapping = new MappingStorage();
  const plan = new Plan();
  const planData = testData.planData;
  const originalFolder = 'auto-test';
  const targetFolder = 'sub-auto-test';

  before(() => {
    login(testData.loginData);
    moveVmwareFolder(planData.providerData, planData.sourceClusterName, targetFolder);
  });

  it('Login to MTV and create provider', () => {
    provider.create(planData.providerData);
    networkMapping.create(planData.networkMappingData);
    storageMapping.create(planData.storageMappingData);
    plan.create(planData);
  });

  after(() => {
    moveVmwareFolder(planData.providerData, planData.sourceClusterName, originalFolder);
    cleanUp(planData);
  });
});
