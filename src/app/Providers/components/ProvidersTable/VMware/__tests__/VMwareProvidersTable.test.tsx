import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom';
import { Router } from 'react-router-dom';

import VMwareProvidersTables from '../VMwareProvidersTable';
import { MOCK_INVENTORY_PROVIDERS } from '@app/queries/mocks/providers.mock';

describe('<VMwareProvidersTables />', () => {
  const history = createMemoryHistory();
  const props = {
    providers: MOCK_INVENTORY_PROVIDERS.vsphere,
  };

  it('renders vsphere table', () => {
    render(
      <Router history={history}>
        <VMwareProvidersTables {...props} />
      </Router>
    );

    expect(screen.getByRole('grid', { name: /VMware providers table/ })).toBeInTheDocument();
    expect(
      screen.getByRole('row', { name: /vcenter-1 vcenter.v2v.bos.redhat.com 2 2 41 8 3 Ready/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('row', {
        name: /vcenter-2 vcenter.v2v.bos.redhat.com 2 2 41 8 3 Critical/,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('row', { name: /vcenter-3 vcenter.v2v.bos.redhat.com 2 2 41 8 3 Ready/ })
    ).toBeInTheDocument();
  });

  it('renders Hosts links', () => {
    render(
      <Router history={history}>
        <VMwareProvidersTables {...props} />
      </Router>
    );

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/providers/vcenter-1');
    expect(links[1]).toHaveAttribute('href', '/providers/vcenter-2');
    expect(links[2]).toHaveAttribute('href', '/providers/vcenter-3');
  });

  it('renders status condition', async () => {
    render(
      <Router history={history}>
        <VMwareProvidersTables {...props} />
      </Router>
    );

    userEvent.click(screen.getByRole('button', { name: /Critical/ }));

    await waitFor(() => {
      expect(screen.getByText('The provider is not responding.')).toBeInTheDocument();
    });
  });

  it('renders action menu', async () => {
    render(
      <Router history={history}>
        <VMwareProvidersTables {...props} />
      </Router>
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
