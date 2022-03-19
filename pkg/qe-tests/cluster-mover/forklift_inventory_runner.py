import os
import time
import sys

import kubernetes
from openshift.dynamic import DynamicClient
from forklift_inventory import ForkliftInventoryClient

forklift_namespace = os.getenv("FORKLIFT_NAMESPACE")


def wait_for_host_in_folder(inventory):
    """
    Keep polling Forklift Inventory until host HOST_ID is found inside the folder including the FOLDER_NAME 
    (anything in the path)

    Or Any of the folder's sub-folders.

    Expected Environment Params:
        PROVIDER_NAME (resource name)
        HOST_ID (vmware provider host's host_id)
        FOLDER_NAME (the expected folder search pattern)
        K8_API_KEY
        k8_API_URL


    """
    provider_name = os.getenv("PROVIDER_NAME")
    provider_host_id = os.getenv("HOST_ID")
    provider_expected_folder_name = os.getenv("FOLDER_NAME")

    provider = inventory.provider(provider_type="vsphere",
                                  provider_name=provider_name)
    looplimit = 6
    while provider_expected_folder_name not in inventory.host(provider=provider, host_id=provider_host_id)["path"] and looplimit > 0:
        looplimit = looplimit - 1
        time.sleep(10)
    if provider_expected_folder_name not in inventory.host(provider=provider, host_id=provider_host_id)["path"]:
        sys.exit(1)


if __name__ == "__main__":
    # k8 Client
    configuration = kubernetes.client.Configuration()
    configuration.api_key["authorization"] = f"Bearer {os.getenv('K8_API_KEY')}"
    configuration.verify_ssl = False if os.getenv("IGNORE_CERT_CHECK") else True
    configuration.host = os.getenv("K8_API_URL")
    dyn_client = DynamicClient(client=kubernetes.client.ApiClient(configuration))

    # Inventory Client
    inventory = ForkliftInventoryClient(forklift_namespace=forklift_namespace, dyn_client=dyn_client)

    # Execute the function by name given as a commend line argument
    eval(f"{sys.argv[1]}(inventory=inventory)")
