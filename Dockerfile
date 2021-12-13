# Builder image
FROM registry.access.redhat.com/ubi8/nodejs-16 as builder
COPY . .
USER root
RUN npm config set unsafe-perm true && npm run install:ws && npm run build

# Runner image
FROM registry.access.redhat.com/ubi8/nodejs-16-minimal

# Add tar package to allow copying files with kubectl scp
USER root
RUN microdnf -y install tar && microdnf clean all
USER 1001

LABEL name="konveyor/forklift-ui" \
      description="Konveyor for Virtualization - User Interface" \
      help="For more information visit https://konveyor.io" \
      license="Apache License 2.0" \
      maintainer="mturley@redhat.com,gdubreui@redhat.com,ibolton@redhat.com" \
      summary="Konveyor for Virtualization - User Interface" \
      url="https://quay.io/repository/konveyor/forklift-ui" \
      usage="podman run -p 8080 -v /etc/forklift-ui/meta.json:/etc/forklift-ui/meta.json konveyor/forklift-ui:latest" \
      com.redhat.component="konveyor-forklift-ui-container" \
      io.k8s.display-name="forklift-ui" \
      io.k8s.description="Konveyor for Virtualization - User Interface" \
      io.openshift.expose-services="8080:http" \
      io.openshift.tags="operator,konveyor,ui,nodejs16" \
      io.openshift.min-cpu="100m" \
      io.openshift.min-memory="350Mi"

COPY --from=builder /opt/app-root/src/config /opt/app-root/src/config
COPY --from=builder /opt/app-root/src/pkg/api/dist/src /opt/app-root/src/pkg/api/dist/src
COPY --from=builder /opt/app-root/src/dist /opt/app-root/src/dist
COPY --from=builder /opt/app-root/src/dist/index.html.ejs /opt/app-root/src/views/index.html.ejs
COPY --from=builder /opt/app-root/src/node_modules /opt/app-root/src/node_modules
COPY --from=builder /opt/app-root/src/package.json /opt/app-root/src

COPY --from=builder /opt/app-root/src/entrypoint.sh /usr/bin/entrypoint.sh

ENV META_FILE="/etc/forklift-ui/meta.json"

ENTRYPOINT ["/usr/bin/entrypoint.sh"]
