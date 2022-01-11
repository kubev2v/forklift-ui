import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom';
import { Router } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from 'react-query';
const queryClient = new QueryClient();

import { NetworkContextProvider } from '@app/common/context';
import { AddEditProviderModal } from '../AddEditProviderModal';
import { MOCK_CLUSTER_PROVIDERS } from '@app/queries/mocks/providers.mock';

beforeAll(() => (window.HTMLElement.prototype.scrollIntoView = jest.fn()));

describe('<AddEditProviderModal />', () => {
  const toggleModalAndResetEdit = () => {
    return;
  };

  const history = createMemoryHistory();
  const props = {
    onClose: toggleModalAndResetEdit,
  };

  it.skip('allows to cancel addition/edition of a provider', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NetworkContextProvider>
          <Router history={history}>
            <AddEditProviderModal {...props} providerBeingEdited={null} />
          </Router>
        </NetworkContextProvider>
      </QueryClientProvider>
    );

    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  // oVirt Provider

  it('allows adding a oVirt provider', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NetworkContextProvider>
          <Router history={history}>
            <AddEditProviderModal {...props} providerBeingEdited={null} />
          </Router>
        </NetworkContextProvider>
      </QueryClientProvider>
    );

    const typeButton = await screen.findByLabelText(/provider type/i);
    userEvent.click(typeButton);
    await waitFor(() => {
      null;
    });
    const oVirtButton = await screen.findByRole('option', { name: /ovirt/i, hidden: true });
    userEvent.click(oVirtButton);
    await waitFor(() => {
      null;
    });
    const caCertField = screen.getByLabelText(/^File upload/);
    const name = screen.getByRole('textbox', { name: /Name/ });
    const hostname = screen.getByRole('textbox', {
      name: /oVirt Engine host name or IP address/i,
    });
    const username = screen.getByRole('textbox', { name: /oVirt Engine user name/i });
    const password = screen.getByLabelText(/^oVirt Engine password/);
    await waitFor(() => {
      userEvent.type(name, 'providername');
      userEvent.type(hostname, 'host.example.com');
      userEvent.type(username, 'username');
      userEvent.type(password, 'password');
      userEvent.type(caCertField, '-----BEGIN CERTIFICATE-----abc-----END CERTIFICATE-----');
    });

    const addButton = await screen.findByRole('dialog', { name: /Add provider/ });
    await waitFor(() => expect(addButton).toBeEnabled());
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    await waitFor(() => expect(cancelButton).toBeEnabled());
  });

  // Vsphere Provider

  it.skip('allows adding a vsphere provider', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NetworkContextProvider>
          <Router history={history}>
            <AddEditProviderModal {...props} providerBeingEdited={null} />
          </Router>
        </NetworkContextProvider>
      </QueryClientProvider>
    );

    const typeButton = await screen.findByLabelText(/provider type/i);
    userEvent.click(typeButton);
    const vsphereButton = await screen.findByRole('option', { name: /vmware/i, hidden: true });
    userEvent.click(vsphereButton);

    const name = screen.getByRole('textbox', { name: /Name/ });
    const hostname = screen.getByRole('textbox', {
      name: /vCenter host name or IP address/i,
    });
    const username = screen.getByRole('textbox', { name: /vCenter user name/i });
    const password = screen.getByLabelText(/^vCenter password/);

    userEvent.type(name, 'providername');
    userEvent.type(hostname, 'host.example.com');
    userEvent.click(username);
    userEvent.type(username, 'username');
    userEvent.type(password, 'password');

    const verifyButton = await screen.findByLabelText(/verify certificate/i);
    await waitFor(() => {
      userEvent.click(verifyButton);
    });

    expect(verifyButton).toBeEnabled();
    expect(
      screen.getByText('39:5C:6A:2D:36:38:B2:52:2B:21:EA:74:11:59:89:5E:20:D5:D9:A2')
    ).toBeInTheDocument();
    const validateCertificationCheckbox = screen.getByRole('checkbox', {
      name: /validate certificate/i,
    });

    userEvent.click(validateCertificationCheckbox);

    expect(validateCertificationCheckbox).toBeChecked();
    const addButton = await screen.findByRole('dialog', { name: /Add provider/ });
    expect(addButton).toBeEnabled();
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  it.skip('fails to add a vsphere provider with wrong values', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NetworkContextProvider>
          <Router history={history}>
            <AddEditProviderModal {...props} providerBeingEdited={null} />
          </Router>
        </NetworkContextProvider>
      </QueryClientProvider>
    );

    const typeButton = await screen.findByLabelText(/provider type/i);
    userEvent.click(typeButton);
    const vsphereButton = await screen.findByRole('option', { name: /vmware/i, hidden: true });
    userEvent.click(vsphereButton);

    const name = screen.getByRole('textbox', { name: /Name/ });
    const hostname = screen.getByRole('textbox', {
      name: /vCenter host name or IP address/i,
    });
    const username = screen.getByRole('textbox', { name: /vCenter user name/i });
    const password = screen.getByLabelText(/^vCenter password/);

    userEvent.type(name, 'providername');
    userEvent.type(hostname, 'hostname');
    userEvent.type(username, 'username');
    userEvent.type(password, 'password');

    const addButton = await screen.findByRole('button', { name: /Add/ });
    expect(addButton).toBeDisabled();
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  it.skip('allows editing a vsphere provider', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NetworkContextProvider>
          <Router history={history}>
            <AddEditProviderModal {...props} providerBeingEdited={MOCK_CLUSTER_PROVIDERS[0]} />
          </Router>
        </NetworkContextProvider>
      </QueryClientProvider>
    );

    const editButton = await screen.findByRole('dialog', { name: /Edit provider/ });
    expect(editButton).not.toHaveAttribute('disabled');
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  // OpenShift Provider

  it.skip('allows to add an openshift provider', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NetworkContextProvider>
          <Router history={history}>
            <AddEditProviderModal {...props} providerBeingEdited={null} />
          </Router>
        </NetworkContextProvider>
      </QueryClientProvider>
    );

    const typeButton = await screen.findByLabelText(/provider type/i);
    userEvent.click(typeButton);
    const openshiftButton = await screen.findByRole('option', { name: /kubevirt/i, hidden: true });
    userEvent.click(openshiftButton);

    const name = screen.getByRole('textbox', { name: /name/i });
    const url = screen.getByRole('textbox', { name: /url/i });
    const saToken = screen.getByLabelText(/^Service account token/);

    userEvent.type(name, 'providername');
    userEvent.type(url, 'http://host.example.com');
    userEvent.type(saToken, 'saToken');

    const addButton = await screen.findByRole('dialog', { name: /Add provider/ });
    expect(addButton).toBeEnabled();
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  it.skip('fails to add an openshift provider with wrong values', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NetworkContextProvider>
          <Router history={history}>
            <AddEditProviderModal {...props} providerBeingEdited={null} />
          </Router>
        </NetworkContextProvider>
      </QueryClientProvider>
    );

    const typeButton = await screen.findByLabelText(/provider type/i);
    userEvent.click(typeButton);
    const openshiftButton = await screen.findByRole('option', { name: /kubevirt/i, hidden: true });
    userEvent.click(openshiftButton);

    const name = screen.getByRole('textbox', { name: /name/i });
    const url = screen.getByRole('textbox', { name: /url/i });
    const saToken = screen.getByLabelText(/^Service account token/);

    userEvent.type(name, 'providername');
    userEvent.type(url, 'host');
    userEvent.type(saToken, 'saToken');

    const addButton = await screen.getByRole('button', { name: /Add/ });
    expect(addButton).toBeDisabled();
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  it.skip('allows editing an openshift provider', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <NetworkContextProvider>
          <Router history={history}>
            <AddEditProviderModal {...props} providerBeingEdited={MOCK_CLUSTER_PROVIDERS[4]} />
          </Router>
        </NetworkContextProvider>
      </QueryClientProvider>
    );

    const editButton = await screen.findByRole('dialog', { name: /Edit provider/ });
    expect(editButton).toBeEnabled();
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });
});
