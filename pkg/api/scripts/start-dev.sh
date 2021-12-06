#!/bin/bash
_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo $_dir
cd $_dir/../../..
echo `pwd`
export NODE_ENV=development
export DEBUG=1
export EXPRESS_PORT=9001
export NODE_TLS_REJECT_UNAUTHORIZED="0"
./node_modules/concurrently/bin/concurrently.js --names "EXPRESS,WEBPACK" -c "green.bold.inverse,blue.bold.inverse" \
  "$_dir/run-local-express.sh --auto-reload" \
  "./node_modules/webpack/bin/webpack.js serve \
    --hot --color --config=./config/webpack.dev.js"
