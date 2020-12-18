import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom';
import { Router } from 'react-router-dom';

import { NetworkContextProvider } from '@app/common/context';
import PlanWizard from '../PlanWizard';
import { debug } from 'webpack';

describe('<AddEditProviderModal />', () => {
  const history = createMemoryHistory();

  it('allows to cancel a plan wizard', async () => {
    render(
      <NetworkContextProvider>
        <Router history={history}>
          <PlanWizard />
        </Router>
      </NetworkContextProvider>
    );

    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();
  });

  it('allows to create a plan', async () => {
    render(
      <NetworkContextProvider>
        <Router history={history}>
          <PlanWizard />
        </Router>
      </NetworkContextProvider>
    );

    const name = await screen.findByRole('textbox', { name: /plan name/i });
    const description = await screen.findByRole('textbox', { name: /plan description/i });
    const providers = await screen.findAllByLabelText(/select a provider/i);
    const namespace = await screen.findByPlaceholderText('Select a namespace');

    expect(namespace).toBeDisabled();

    userEvent.type(name, 'planname');
    userEvent.type(description, 'plan descripton');

    userEvent.click(providers[0]);
    await screen.findByRole('option', {
      name: /vcenter-1/i,
      hidden: true,
    });

    userEvent.click(providers[1]);
    await screen.findByRole('option', {
      name: /ocpv-1/i,
      hidden: true,
    });

    expect(namespace).toHaveAttribute('disabled', '');
    userEvent.click(namespace);
    userEvent.type(namespace, 'test-namespace');

    const nextButton = await screen.findByRole('button', { name: /Next/ });
    expect(nextButton).toHaveAttribute('disabled', '');
    const cancelButton = await screen.findByRole('button', { name: /Cancel/ });
    expect(cancelButton).toBeEnabled();

    userEvent.click(nextButton);

    // TODO: Continue to VMs selection
  });

  it('allows to edit a plan', async () => {
    const history = createMemoryHistory();
    history.push('/plans/plantest-2/edit');
    render(
      <NetworkContextProvider>
        <Router history={history}>
          <PlanWizard />
        </Router>
      </NetworkContextProvider>
    );

    await waitFor(() => {
      screen.getByLabelText(/Plan name/);
    });
  });
});
