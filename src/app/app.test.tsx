import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { App } from '.';

describe('App', () => {
  test('renders welcome page without errors', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Forklift/ })).toBeInTheDocument;
  });
});
