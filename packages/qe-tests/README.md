# End-to-end Cypress tests for forklift-ui

##examples of usage:

###One of examples how to define CLI variables for running tests:
`export cypress_url="https://"$(oc get routes --all-namespaces|grep migration|grep ui|awk '{print $3}')`

### Running test with another way of defining CLI  variable
`$(npm bin)/cypress run --env pass=$(cat /home/igor/cnv-qe.rhcloud.com/ibragins/auth/kubeadmin-password) --browser firefox --spec "cypress/integration/tests/basicFlowTest.ts"`

