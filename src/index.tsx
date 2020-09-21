import React from 'react';
import ReactDOM from 'react-dom';
import { App } from '@app/index';

let app: React.ReactElement | null = null;

if (process.env.NODE_ENV !== 'production') {
  const config = {
    rules: [
      {
        id: 'color-contrast',
        enabled: false,
      },
    ],
  };
  // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
  const axe = require('react-axe');
  axe(React, ReactDOM, 1000, config);

  // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
  const { ReactQueryDevtools } = require('react-query-devtools');
  app = (
    <>
      <App />
      <ReactQueryDevtools />
    </>
  );
} else {
  app = <App />;
}

ReactDOM.render(app, document.getElementById('root') as HTMLElement);
