#!/usr/bin/env bash

# Add service serving CA cert to the global CA bundle
if [ -f "/var/run/secrets/kubernetes.io/serviceaccount/service-ca.crt" ]; then
    cat /var/run/secrets/kubernetes.io/serviceaccount/service-ca.crt >> /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
fi

exec npm run -s start
