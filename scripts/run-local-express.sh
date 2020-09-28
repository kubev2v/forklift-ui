#!/bin/bash
_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $_dir/..
if [ "$1" == "--auto-reload" ]; then
  node node_modules/nodemon/bin/nodemon.js server.js
else
  node server.js
fi
