import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom';
import { Router } from 'react-router-dom';

import { NetworkContextProvider } from '@app/common/context';
import AddEditProviderModal from '../AddEditProviderModal';
import { MOCK_PROVIDERS } from '@app/queries/mocks/providers.mock';

describe('<AddEditProviderModal />', () => {
  const toggleModalAndResetEdit = () => {
    return;
  };

  const history = createMemoryHistory();
  const props = {
    onClose: toggleModalAndResetEdit,
  };

  it('allows adding a vsphere provider', async () => {
    render(
      <NetworkContextProvider>
        <Router history={history}>
          <AddEditProviderModal {...props} providerBeingEdited={null} />
        </Router>
      </NetworkContextProvider>
    );

    const typeButton = await screen.findByRole('button', { name: /select a provider type/i });
    userEvent.click(typeButton);
    const vsphereButton = await screen.findByRole('option', { name: /vmware/i, hidden: true });
    userEvent.click(vsphereButton);

    await waitFor(() => {
      const name = screen.getByLabelText(/Name/);
      const hostname = screen.getByLabelText(/Hostname/);
      const username = screen.getByLabelText(/Username/);
      const password = screen.getByLabelText(/Password/);
      const certFingerprint = screen.getByLabelText(/Certificate SHA1 Fingerprint/);

      userEvent.type(name, 'providername');
      userEvent.type(hostname, 'host.example.com');
      userEvent.type(username, 'username');
      userEvent.type(password, 'password');
      userEvent.type(
        certFingerprint,
        'AA:39:A3:EE:5E:6B:4B:0D:32:55:BF:EF:95:60:18:90:AF:D8:07:09'
      );
    });

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /Add/ });
      // TODO By default in mock mode adding a provider is disabled
      // We need to activate it and mock backend if needed
      expect(addButton).toBeDisabled();
    });
  });

  it('refuses to add a vsphere provider with wrong values', async () => {
    render(
      <NetworkContextProvider>
        <Router history={history}>
          <AddEditProviderModal {...props} providerBeingEdited={null} />
        </Router>
      </NetworkContextProvider>
    );

    const typeButton = await screen.findByRole('button', { name: /select a provider type/i });
    userEvent.click(typeButton);
    const vsphereButton = await screen.findByRole('option', { name: /vmware/i, hidden: true });
    userEvent.click(vsphereButton);

    await waitFor(() => {
      const name = screen.getByLabelText(/Name/);
      const hostname = screen.getByLabelText(/Hostname/);
      const username = screen.getByLabelText(/Username/);
      const password = screen.getByLabelText(/Password/);
      const certFingerprint = screen.getByLabelText(/Certificate SHA1 Fingerprint/);

      userEvent.type(name, 'providername');
      userEvent.type(hostname, 'hostname');
      userEvent.type(username, 'username');
      userEvent.type(password, 'password');
      userEvent.type(
        certFingerprint,
        'AA:39:A3:EE:5E:6B:4B:0D:32:55:BF:EF:95:60:18:90:AF:D8:07:09'
      );
    });

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /Add/ });
      expect(addButton).toBeDisabled();
    });
  });

  it('allows editing an existing vsphere provider', async () => {
    render(
      <NetworkContextProvider>
        <Router history={history}>
          <AddEditProviderModal {...props} providerBeingEdited={MOCK_PROVIDERS.vsphere[0]} />
        </Router>
      </NetworkContextProvider>
    );

    const addButton = await screen.findByRole('button', { name: /Save/ });
    expect(addButton).not.toHaveAttribute('disabled');
  });
});
