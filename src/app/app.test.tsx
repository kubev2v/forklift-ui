import * as React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { App } from '.';
import { APP_TITLE } from './common/constants';

describe('App', () => {
  test('renders welcome page without errors', async () => {
    render(<App />);
    const headings = screen.getAllByRole('heading');
    await waitFor(() => expect(headings[1]).toHaveTextContent(APP_TITLE));
  });
});
