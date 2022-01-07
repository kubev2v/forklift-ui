#!/usr/bin/env bash

# Copy the main CA bundle to /opt/app-root/src/ca.crt
# If a custom certificate is deployed for ingress, the
# /etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem file
# exists and should be used. Otherwise, we use the default.
if [ -f "/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem" ]; then
    cp /etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem /opt/app-root/src/ca.crt
else
    cp /var/run/secrets/kubernetes.io/serviceaccount/ca.crt /opt/app-root/src/ca.crt
fi

# Add service serving CA cert to the global CA bundle if it exists
if [ -f "/var/run/secrets/kubernetes.io/serviceaccount/service-ca.crt" ]; then
    cat /var/run/secrets/kubernetes.io/serviceaccount/service-ca.crt >> /opt/app-root/src/ca.crt
fi

exec npm run -s start
