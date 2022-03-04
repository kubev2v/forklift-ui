# writen by Amos
# See: https://docs.openshift.com/container-platform/4.9/security/certificates/replacing-default-ingress-certificate.html

WAIT_INTERVAL_SEC=10
FAIL_AFTER=50 # wait  2 * 50 second before faling

echo create CA Files
openssl genrsa -passout pass:12345678 -des3 -out domain.key 2048
openssl req -key domain.key -new -out domain.csr -batch -passin pass:12345678
openssl req -x509 -sha256 -days 1825 -newkey rsa:2048 -keyout rootCA.key -out rootCA.crt -passout pass:12345678 -batch
openssl x509 -req -CA rootCA.crt -CAkey rootCA.key -in domain.csr -out domain.crt -days 365 -CAcreateserial -extfile domain.ext -passin pass:12345678
openssl rsa -in rootCA.key  -out rootCA-dec.key -passin pass:12345678

echo publish Certificat in Openshift
oc create configmap custom-ca \
     --from-file=ca-bundle.crt=rootCA.crt \
     -n openshift-config

oc patch proxy/cluster \
     --type=merge \
     --patch='{"spec":{"trustedCA":{"name":"custom-ca"}}}'

echo configuration ingress
oc delete secret ingress-custom-root-ca -n openshift-ingress

oc create secret tls ingress-custom-root-ca \
     --cert=rootCA.crt \
     --key=rootCA-dec.key \
     -n openshift-ingress


# To insure Reconsilidation happens in case the secret was already set
oc patch ingresscontroller.operator default \
     --type=merge -p \
     '{"spec":{"defaultCertificate": {"name": "for-recon-temp"}}}' \
     -n openshift-ingress-operator

oc patch ingresscontroller.operator default \
     --type=merge -p \
     '{"spec":{"defaultCertificate": {"name": "ingress-custom-root-ca"}}}' \
     -n openshift-ingress-operator

echo verify the new cert is used.
host=`oc whoami --show-console|awk -F'//' '{print $2}'`
is_new_cert=''

looplimit=$FAIL_AFTER
while [[ -z $is_new_cert  && $looplimit > -1 ]]
do
	echo still waitting for new cert...
	let "looplimit=looplimit-1"
	sleep $WAIT_INTERVAL_SEC
	is_new_cert=`openssl s_client -showcerts -servername $host -connect $host:443|grep 'Default Company Ltd'`

done

if [[  -z $is_new_cert ]]
then
	echo timeout out... giving up wating for the sert to be used.
	exit 1
fi

echo done.
echo to revert run revert-rout-root-ca.sh






