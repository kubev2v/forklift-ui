# End-to-end Cypress tests for forklift-ui

##examples of usage:

###One of examples how to define CLI variables for running tests:
```bash
export cypress_url="https://"$(oc get routes --all-namespaces|grep migration|grep ui|awk '{print $3}')
```
This exact example shows how to get defined URL to access MTV UI

### Running test with another way of defining CLI  variable
```bash
cd ~/github.com/forklift-ui/pkg/qe-tests/
export KUBECONFIG=~/cnv-qe.rhcloud.com/mig01/auth/kubeconfig
../../node_modules/.bin/cypress run --env pass=$(cat ~/cnv-qe.rhcloud.com/mig01/auth/kubeadmin-password) --browser firefox --spec "cypress/integration/tests/basicFlowTest.ts"
```

### Using cypress.json to define test variables
```bash
cd ~/github.com/forklift-ui/pkg/qe-tests/
export KUBECONFIG=~/cnv-qe.rhcloud.com/mig01/auth/kubeconfig
../../node_modules/.bin/cypress open --config-file=test-config.json
```
`test-config.json` is a configuration file that should include all required variables for the test
This should look like:
```json
{
  "projectId": "128076ed-9868-4e98-9cef-98dd8b705d75",
  "env": {
    "vmware_login": "username",
    "vmware_pass": "password"
  }
}
```
One running this can create more such files and use them as needed

