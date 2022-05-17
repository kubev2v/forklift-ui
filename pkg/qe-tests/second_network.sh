cat <<EOF | oc apply -f -
apiVersion: "k8s.cni.cncf.io/v1"
kind: NetworkAttachmentDefinition
metadata:
  name: mybridge
spec:
  config: '{
  "cniVersion": "0.3.1",
  "type": "cnv-bridge",
  "bridge": "mybridge"
  }'
EOF
