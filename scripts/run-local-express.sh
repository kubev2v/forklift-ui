#!/bin/bash
_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export MIGMETA_FILE="$_dir/../tmp/migmeta.json"
export STATIC_DIR="$_dir/../dist"
export NODE_TLS_REJECT_UNAUTHORIZED="0"
mkdir -p "$STATIC_DIR"
cd $_dir/..
if [ "$1" == "--auto-reload" ]; then
  node $_dir/../node_modules/nodemon/bin/nodemon.js --watch $_dir/../deploy $_dir/../deploy/server.js
else
  node $_dir/../deploy/server.js
fi
