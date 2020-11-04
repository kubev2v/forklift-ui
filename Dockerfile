# Builder image
FROM registry.access.redhat.com/ubi8/nodejs-12 as builder
COPY . /virt-ui
WORKDIR /virt-ui
USER root
RUN dnf config-manager --add-repo https://dl.yarnpkg.com/rpm/yarn.repo && \
    dnf -y install yarn && yarn && yarn build


# Runner image
FROM registry.access.redhat.com/ubi8/nodejs-12

LABEL name="konveyor/virt-ui" \
      description="Konveyor for Virtualization - User Interface" \
      help="For more information visit https://konveyor.io" \
      license="Apache License 2.0" \
      maintainer="mturley@redhat.com,gdubreui@redhat.com,ibolton@redhat.com" \
      summary="Konveyor for Virtualization - User Interface" \
      url="https://quay.io/repository/konveyor/virt-ui" \
      usage="podman run -p 8080 -v /etc/virt-ui/virtMeta.json:/etc/virt-ui/virtMeta.json konveyor/virt-ui:latest" \
      com.redhat.component="konveyor-virt-ui-container" \
      io.k8s.display-name="virt-ui" \
      io.k8s.description="Konveyor for Virtualization - User Interface" \
      io.openshift.expose-services="8080:http" \
      io.openshift.tags="operator,konveyor,ui,nodejs12" \
      io.openshift.min-cpu="100m" \
      io.openshift.min-memory="350Mi"

COPY --from=builder /virt-ui/config /opt/app-root/src/config
COPY --from=builder /virt-ui/deploy /opt/app-root/src/deploy
COPY --from=builder /virt-ui/dist /opt/app-root/src/dist
COPY --from=builder /virt-ui/dist/index.html.ejs /opt/app-root/src/views/index.html.ejs
COPY --from=builder /virt-ui/node_modules /opt/app-root/src/node_modules
COPY --from=builder /virt-ui/package.json /opt/app-root/src

ENV VIRTMETA_FILE="/etc/virt-ui/virtMeta.json"
ENV NODE_TLS_REJECT_UNAUTHORIZED="0"

ENTRYPOINT ["npm", "run", "-d", "start"]
