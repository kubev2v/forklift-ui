import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Mappings from '@app/Mappings/Mappings';
import { MappingType } from '@app/queries/types';

describe('Mappings', () => {
  const noop = jest.fn();
  test('renders mappings component initially in loading state', async () => {
    render(
      <Mappings
        openEditMappingModal={noop}
        toggleModalAndResetEdit={noop}
        mappingType={'Network' as MappingType}
      />
    );

    const result = await screen.getByText('Loading...');
  });
});
