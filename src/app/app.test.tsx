import * as React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { App } from '.';

describe('App', () => {
  test('renders welcome page without errors', async () => {
    render(<App />);
    await waitFor(() => screen.getByRole('heading'));
    expect(screen.getByRole('heading')).toHaveTextContent('Migration Toolkit for Virtualization');
  });
});
