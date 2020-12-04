#!/bin/bash
_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $_dir/..
export NODE_ENV=development
export DEBUG=1
export EXPRESS_PORT=9001
export NODE_TLS_REJECT_UNAUTHORIZED="0"
npm run concurrently --names "EXPRESS,WEBPACK" -c "green.bold.inverse,blue.bold.inverse" \
  "$_dir/run-local-express.sh --auto-reload" \
  "./node_modules/webpack-dev-server/bin/webpack-dev-server.js \
    --hot --color --progress --info=true --config=$_dir/../config/webpack.dev.js"
