#!/usr/bin/env bash

# Add service serving CA cert to the global CA bundle
if [ -f "/var/run/secrets/kubernetes.io/serviceaccount/service-ca.crt" ]; then
    cp /var/run/secrets/kubernetes.io/serviceaccount/ca.crt /opt/app-root/src/ca.crt
    cat /var/run/secrets/kubernetes.io/serviceaccount/service-ca.crt >> /opt-app-root/src/ca.crt
fi

exec npm run -s start
