import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { App } from '.';
import { APP_TITLE } from './common/constants';

describe('App', () => {
  test('renders welcome page without errors', async () => {
    process.env['DATA_SOURCE'] = '';
    render(<App />);
    expect(screen.getByRole('heading', { name: new RegExp(APP_TITLE) })).toBeInTheDocument;
  });
});
