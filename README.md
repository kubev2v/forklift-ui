# virt-ui

Migration Toolkit for Virtualization UI

[![Build Status](https://travis-ci.com/konveyor/virt-ui.svg?branch=master)](https://travis-ci.com/konveyor/virt-ui)

## Prerequisites

- [NodeJS](https://nodejs.org/en/) >= 12.x
- [Yarn "Classic"](https://classic.yarnpkg.com/lang/en/) (1.x)

## Quick-start

Clone and install dependencies:

```bash
git clone https://github.com/konveyor/virt-ui
cd virt-ui
yarn install
```

Run the UI in local development mode at http://localhost:9000:

```sh
yarn start:dev
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
yarn build
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
import StatusIcon from '@app/common/components/StatusIcon';
```

In general, we should use relative paths `../` when they make sense for co-located files, and absolute paths for things located near the root. The goal is to avoid long and hard-to-read relative paths.

---

## More Information

The configuration of this repository is based on [patternfly-react-seed](https://github.com/patternfly/patternfly-react-seed/). See that project's README for more information:

- [Details about our code quality tools](https://github.com/patternfly/patternfly-react-seed#code-quality-tools)
- [How to use raster image assets](https://github.com/patternfly/patternfly-react-seed#raster-image-support)
- [How to use vector image assets](https://github.com/patternfly/patternfly-react-seed#vector-image-support)
- [How to use environment variables](https://github.com/patternfly/patternfly-react-seed#multi-environment-configuration)

---

## TODO:

- Choose a project board and track smaller tasks (JIRA? GH Projects?)
- Add support for SCSS instead of regular CSS
- Choose a solution for form state and validation
- Choose a solution for API stuff (redux-saga? share k8s client with mig-ui?)
  - Do we want to consider redux alternatives?
- Figure out API integration and deployment details
