#!/usr/bin/bash +x

WAIT_INTERVAL_SEC=10
FAIL_AFTER=50 # wait  50 * 10 second before faling


oc delete configmap custom-ca  -n openshift-config
oc patch ingresscontroller.operator default --type json -p '[{ "op": "remove", "path": "/spec/defaultCertificate" }]' -n openshift-ingress-operator
oc patch proxy/cluster \
     --type=merge \
     --patch='{"spec":{"trustedCA":{"name":"custom-ca"}}}'

echo verify the default ceret is used again
host=`oc whoami --show-console|awk -F'//' '{print $2}'`
is_new_cert=' '

looplimit=$FAIL_AFTER
while [[ ! -z $is_new_cert  && $looplimit > -1 ]]
do
        echo still waitting for original cert
        let "looplimit=looplimit-1"
        sleep $WAIT_INTERVAL_SEC
        is_new_cert=`openssl s_client -showcerts -servername $host -connect $host:443|grep 'Default Company Ltd'`

done

if [[ ! -z $is_new_cert ]]
then
        echo timeout out... giving up wating for the cert to be used.
        exit 1
fi

echo done.

