#!/bin/bash
_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export META_FILE="$_dir/../config/meta.dev.json"
export STATIC_DIR="$_dir/../dist"
mkdir -p "$STATIC_DIR"
cd $_dir/..
if [ "$1" == "--auto-reload" ]; then
  node --trace-deprecation $_dir/../node_modules/nodemon/bin/nodemon.js --watch $_dir/../packages/web/src $_dir/../dist/server.js
else
  node --trace-deprecation $_dir/../dist/server.js
fi
