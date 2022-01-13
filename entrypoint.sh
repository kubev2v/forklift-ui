#!/usr/bin/env bash

# Copy the main CA bundle to /opt/app-root/src/ca.crt
# If a custom certificate is deployed for ingress, the
# /etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem file
# exists and should be used. Otherwise, we use the default.

# Add Kube API CA, if it exists
if [ -f "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt" ]; then
   cp /var/run/secrets/kubernetes.io/serviceaccount/ca.crt ${NODE_EXTRA_CA_CERTS}
fi

# Add service serving CA cert to the global CA bundle if it exists
if [ -f "/var/run/secrets/kubernetes.io/serviceaccount/service-ca.crt" ]; then
    cat /var/run/secrets/kubernetes.io/serviceaccount/service-ca.crt >> ${NODE_EXTRA_CA_CERTS}
fi

# Add custom ingress CA if it exists
if [ -f "/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem" ]; then
    cat /etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem >> ${NODE_EXTRA_CA_CERTS}
fi

exec npm run -s start
