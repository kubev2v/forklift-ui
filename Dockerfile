# Builder image
FROM registry.access.redhat.com/ubi8/nodejs-14 as builder
COPY . /forklift-ui
WORKDIR /forklift-ui
USER root
RUN dnf config-manager --add-repo https://dl.yarnpkg.com/rpm/yarn.repo && \
    dnf -y install yarn && yarn && yarn build


# Runner image
FROM registry.access.redhat.com/ubi8/nodejs-14

LABEL name="konveyor/forklift-ui" \
      description="Konveyor for Virtualization - User Interface" \
      help="For more information visit https://konveyor.io" \
      license="Apache License 2.0" \
      maintainer="mturley@redhat.com,gdubreui@redhat.com,ibolton@redhat.com" \
      summary="Konveyor for Virtualization - User Interface" \
      url="https://quay.io/repository/konveyor/forklift-ui" \
      usage="podman run -p 8080 -v /etc/forklift-ui/virtMeta.json:/etc/forklift-ui/virtMeta.json konveyor/forklift-ui:latest" \
      com.redhat.component="konveyor-forklift-ui-container" \
      io.k8s.display-name="forklift-ui" \
      io.k8s.description="Konveyor for Virtualization - User Interface" \
      io.openshift.expose-services="8080:http" \
      io.openshift.tags="operator,konveyor,ui,nodejs14" \
      io.openshift.min-cpu="100m" \
      io.openshift.min-memory="350Mi"

COPY --from=builder /forklift-ui/config /opt/app-root/src/config
COPY --from=builder /forklift-ui/deploy /opt/app-root/src/deploy
COPY --from=builder /forklift-ui/dist /opt/app-root/src/dist
COPY --from=builder /forklift-ui/dist/index.html.ejs /opt/app-root/src/views/index.html.ejs
COPY --from=builder /forklift-ui/node_modules /opt/app-root/src/node_modules
COPY --from=builder /forklift-ui/package.json /opt/app-root/src

ENV VIRTMETA_FILE="/etc/forklift-ui/virtMeta.json"

ENTRYPOINT ["npm", "run", "-d", "start"]
