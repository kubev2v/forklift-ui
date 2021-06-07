import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MappingsPage } from '@app/Mappings/MappingsPage';

describe('MappingsPage', () => {
  test('renders mappings page without errors', async () => {
    render(<MappingsPage />);
    const defaultTab = await screen.getByText('Network Mappings');
    screen.getByRole('button', {
      name: /Create mapping/i,
    });

    expect(defaultTab).toBeDefined();

    const storageTabBtn = screen.getByRole('button', {
      name: /Storage/i,
    });
    storageTabBtn.click();
    const newlySelectedTab = await screen.getByText('Storage Mappings');
    expect(newlySelectedTab).toBeDefined();
  });
});
