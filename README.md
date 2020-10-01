# virt-ui

Migration Toolkit for Virtualization UI

[![Build Status](https://travis-ci.com/konveyor/virt-ui.svg?branch=master)](https://travis-ci.com/konveyor/virt-ui)

A read-only preview with mock data is available at http://konveyor-virt-ui-preview.surge.sh/.

## Prerequisites

- [NodeJS](https://nodejs.org/en/) >= 10.x
- [Yarn "Classic"](https://classic.yarnpkg.com/lang/en/) (1.x)

## Quick-start

Clone and install dependencies:

```bash
git clone https://github.com/konveyor/virt-ui
cd virt-ui
yarn install
```

Create a virtMeta.config.json file in the config directory using [`config/virtMeta.example.json`](https://github.com/konveyor/virt-ui/blob/master/config/virtMeta.example.json) as a template. Set the `INVENTORY_API_URL` variable to the root URL of your virt-controller inventory API, and set `CLUSTER_API_URL` to the root URL of your host OpenShift cluster API.

If you plan to run webpack directly, Create a file named `.env` in the repository root, using [`.env.example`](https://github.com/konveyor/virt-ui/blob/master/.env.example) as a template. Here you can set the `DATA_SOURCE`. Otherwise `yarn [start:dev|build]:[mock|remote]` commands will override it.

```bash
DATA_SOURCE=remote  # can be `remote` or `mock`
INVENTORY_API_URL=https://inventory-openshift-migration.example.com/
CLUSTER_API_URL=https://api.example.com:6443

```

Run the UI with webpack-dev-server at http://localhost:9000:

```sh
yarn start:dev:remote  # uses real data from the REMOTE_API_URL in your .env file
yarn start:dev:mock    # uses static mock data, can run offline
yarn start:dev         # uses the DATA_SOURCE defined in your .env file
```

## Development Scripts

To run the type-checker, linter and unit tests:

```sh
# Run all 3:
yarn ci
# Or run them individually:
yarn type-check
yarn lint [--fix]
yarn test [--watch]
```

[Prettier](https://prettier.io/) code formatting is enforced by ESLint. To run Prettier and format your code (do this before committing if you don't run Prettier in your editor):

```sh
yarn format
```

To run a production build using webpack (outputs to `./dist`):

```sh
yarn build:remote  # uses real data from the REMOTE_API_URL in your .env file
yarn build:mock    # uses static mock data, can run offline or be deployed as a preview
yarn build         # uses the DATA_SOURCE defined in your .env file
```

To launch a tool for inspecting the bundle size:

```sh
yarn bundle-profile:analyze
```

## Running in production mode (run a `yarn build` first)

```sh
yarn start
```

## Configurations

- [TypeScript Config](./tsconfig.json)
- [Webpack Config](./webpack.common.js)
- [Jest Config](./jest.config.js)
- [Editor Config](./.editorconfig)

### Import paths

TypeScript is configured to allow importing modules by their absolute path. The prefix `@app/` is an alias for the main `src/app/` directory.

For example:

```ts
import { PROVIDER_TYPE_NAMES } from '@app/common/constants';
```

In general, we should use relative paths `../` when they make sense for co-located files, and absolute paths for things located near the root. The goal is to avoid long and hard-to-read relative paths.

---

## More Information

The configuration of this repository is based on [patternfly-react-seed](https://github.com/patternfly/patternfly-react-seed/). See that project's README for more information:

- [Details about our code quality tools](https://github.com/patternfly/patternfly-react-seed#code-quality-tools)
- [How to use raster image assets](https://github.com/patternfly/patternfly-react-seed#raster-image-support)
- [How to use vector image assets](https://github.com/patternfly/patternfly-react-seed#vector-image-support)
- [How to use environment variables](https://github.com/patternfly/patternfly-react-seed#multi-environment-configuration)
