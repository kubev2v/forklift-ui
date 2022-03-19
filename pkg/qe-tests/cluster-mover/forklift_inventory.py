import logging
import requests
from ocp_resources.route import Route


class ForkliftInventoryClient:
    """
    Forklift Inventory Client
    """

    def get_lazy(self, link):
        return requests.get(link,
                            headers={"Authorization": f"{self.api_key}"},
                            verify=self.verify_certificate_authority).json()

    def get(self, link):
        self_link = f"{self.base_url}/{self.get_lazy(link)['selfLink']}"
        return self.get_lazy(self_link)

    def __init__(
            self,
            forklift_namespace,
            dyn_client,
            verify_certificate_authority=True,
            logger=None, ):
        self.forklift_namespace = forklift_namespace
        self.dyn_client = dyn_client
        self.forklift_app_url = next(Route.get(dyn_client=dyn_client,
                                               name="virt",
                                               namespace=forklift_namespace)).host
        self.verify_certificate_authority = verify_certificate_authority

        self.logger = logger if logger else logging.getLogger(__name__)
        self.api_key = dyn_client.configuration.api_key.get("authorization")
        self.base_url = f"https://{self.forklift_app_url}/inventory-api/"

    def host(self, provider, host_id):
        return [provider for provider in self.hosts(provider=provider)
                if provider["id"] == host_id][0]

    def hosts(self, provider):
        link = f"{self.base_url}/{provider['selfLink']}/hosts"
        return self.get_lazy(link)

    def provider(self, provider_type, provider_name):
        return [provider_ for provider_ in self.providers(provider_type=provider_type)
                if provider_["name"] == provider_name][0]

    def providers(self, provider_type):
        providers = []
        url = f"{self.base_url}/providers?detail=0"
        response_json = self.get_lazy(url)
        for provider_ in response_json.get(provider_type):
            providers.append(self.get(f"{self.base_url}/{provider_['selfLink']}"))

        return providers
