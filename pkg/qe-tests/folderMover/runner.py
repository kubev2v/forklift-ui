import os
import time
import sys

import kubernetes
from openshift.dynamic import DynamicClient
from forklift_inventory import ForkliftInventoryClient

forklift_namespace = os.getenv("FORKLIFT_NAMESPACE")


def wait_for_host_in_folder(inventory):
    '''
    Keep polling Forklift Inventory until host HOST_ID is found inside the folder EXPECTED_DIR

    Or Any of the folder's sub-folders.

    Expecting Enviroment Varaibles:
        PROVIDER_NAME (resource name)
        HOST_ID (vmware provider host's host_id)
        EXPECTED_DIR (the expected folder)

    '''
    provider_name = os.getenv("PROVIDER_NAME")
    provider_host_id = os.getenv("HOST_ID")
    provider_expected_folder_name = os.getenv("EXPECTED_DIR")

    provider = inventory.provider(provider_type="vsphere",
                                  provider_name=provider_name)
    while provider_expected_folder_name not in inventory.host(provider=provider, host_id=provider_host_id)["path"]:
        time.sleep(10)


if __name__ == "__main__":

    # Use KUBECONFIG env to locate the kubeconif file
    dyn_client  = DynamicClient(client=kubernetes.config.new_client_from_config())
    inventory = ForkliftInventoryClient(forklift_namespace=forklift_namespace, dyn_client=dyn_client)
    eval(f"{sys.argv[1]}(inventory=inventory)")
