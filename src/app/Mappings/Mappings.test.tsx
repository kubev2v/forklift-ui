import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Mappings } from '@app/Mappings/Mappings';
import { MappingType } from '@app/queries/types';
import { QueryClientProvider, QueryClient } from 'react-query';
const queryClient = new QueryClient();

describe('Mappings', () => {
  const noop = jest.fn();
  test('renders mappings component initially in loading state', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Mappings
          openEditMappingModal={noop}
          toggleModalAndResetEdit={noop}
          mappingType={MappingType.Network}
        />
      </QueryClientProvider>
    );

    const result = await screen.getByText('Loading...');
    expect(result).toBeDefined();
  });
});
