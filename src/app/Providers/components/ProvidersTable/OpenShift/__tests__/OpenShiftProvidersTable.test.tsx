import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom';
import { Router } from 'react-router-dom';

import { NetworkContextProvider } from '@app/common/context';
import OpenShiftProvidersTable from '../OpenShiftProvidersTable';
import {
  MOCK_CLUSTER_PROVIDERS,
  MOCK_INVENTORY_PROVIDERS,
} from '@app/queries/mocks/providers.mock';
import { correlateProviders } from '../../helpers';
import { ProviderType } from '@app/common/constants';

describe('<OpenShiftProvidersTable />', () => {
  const history = createMemoryHistory();
  const props = {
    providers: correlateProviders(
      MOCK_CLUSTER_PROVIDERS,
      MOCK_INVENTORY_PROVIDERS.openshift,
      ProviderType.openshift
    ),
  };

  it('renders openshift table', () => {
    render(
      <NetworkContextProvider>
        <Router history={history}>
          <OpenShiftProvidersTable {...props} />
        </Router>
      </NetworkContextProvider>
    );

    expect(
      screen.getByRole('grid', { name: /OpenShift Virtualization providers table/ })
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /ocpv-1/ })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /ocpv-2/ })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /ocpv-3/ })).toBeInTheDocument();
  });

  // The expanding section doesn't render, is it the right button?
  it.skip('renders storage classes', async () => {
    render(
      <NetworkContextProvider>
        <Router history={history}>
          <OpenShiftProvidersTable {...props} />
        </Router>
      </NetworkContextProvider>
    );

    const sharedClasses = screen.getAllByRole('button', { name: '0' });
    userEvent.click(sharedClasses[2]);

    await waitFor(() => {
      expect(screen.getByText('large')).toBeInTheDocument();
    });
  });

  it('renders status condition', async () => {
    render(
      <NetworkContextProvider>
        <Router history={history}>
          <OpenShiftProvidersTable {...props} />
        </Router>
      </NetworkContextProvider>
    );

    userEvent.click(screen.getByRole('button', { name: /Critical/ }));

    await waitFor(() => {
      expect(screen.getByText('The provider is not responding.')).toBeInTheDocument();
    });
  });

  it('renders action menu', async () => {
    render(
      <NetworkContextProvider>
        <Router history={history}>
          <OpenShiftProvidersTable {...props} />
        </Router>
      </NetworkContextProvider>
    );

    userEvent.click(screen.getAllByRole('button', { name: /Actions/ })[0]);

    await waitFor(() => {
      const dropdownEdit = screen.getByRole('menuitem', { name: /Edit/ });
      const actionEdit = screen.getByText(/Edit/);

      expect(dropdownEdit).toHaveTextContent('Edit');
      expect(dropdownEdit).toContainElement(actionEdit);

      const dropdownRemove = screen.getByRole('menuitem', { name: /Remove/ });
      const actionRemove = screen.getByText(/Remove/);

      expect(dropdownRemove).toHaveTextContent('Remove');
      expect(dropdownRemove).toContainElement(actionRemove);
    });
  });
});
