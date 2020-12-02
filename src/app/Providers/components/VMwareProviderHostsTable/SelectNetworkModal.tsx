import * as React from 'react';
import * as yup from 'yup';
import { Modal, Button, Form, FormGroup, Checkbox, Stack, Flex } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  useFormState,
  useFormField,
  getFormGroupProps,
  ValidatedTextInput,
} from '@konveyor/lib-ui';

import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { IHost, IHostConfig, IHostNetworkAdapter, IVMwareProvider } from '@app/queries/types';

import './SelectNetworkModal.css';
import { formatHostNetworkAdapter } from './helpers';
import { getExistingHostConfigs, useConfigureHostsMutation } from '@app/queries';
import QueryResultStatus from '@app/common/components/QueryResultStatus';

interface ISelectNetworkModalProps {
  selectedHosts: IHost[];
  hostConfigs: IHostConfig[];
  provider: IVMwareProvider;
  commonNetworkAdapters: IHostNetworkAdapter[];
  onClose: () => void;
}

const useSelectNetworkFormState = (
  selectedHosts: IHost[],
  hostConfigs: IHostConfig[],
  provider: IVMwareProvider
) => {
  const existingHostConfigs = getExistingHostConfigs(selectedHosts, hostConfigs, provider);
  const existingIpAddresses = existingHostConfigs
    .map((config) => config?.spec.ipAddress)
    .filter((ip) => !!ip) as string[];
  const allOnSameIp = Array.from(new Set(existingIpAddresses)).length === 1;
  const preselectedAdapter = allOnSameIp
    ? selectedHosts[0].networkAdapters.find(
        (adapter) => adapter.ipAddress === existingIpAddresses[0]
      ) || null
    : null;

  const isReusingCredentials = useFormField(true, yup.boolean().required());
  const usernameSchema = yup.string().max(320).label('Host admin username');
  const passwordSchema = yup.string().max(256).label('Host admin password');
  return useFormState({
    selectedNetworkAdapter: useFormField<IHostNetworkAdapter | null>(
      preselectedAdapter,
      yup.mixed<IHostNetworkAdapter>().label('Host network').required()
    ),
    adminUsername: useFormField(
      '',
      isReusingCredentials.value ? usernameSchema : usernameSchema.required()
    ),
    adminPassword: useFormField(
      '',
      isReusingCredentials.value ? passwordSchema : passwordSchema.required()
    ),
    isReusingCredentials,
  });
};

export type SelectNetworkFormValues = ReturnType<typeof useSelectNetworkFormState>['values'];

const SelectNetworkModal: React.FunctionComponent<ISelectNetworkModalProps> = ({
  selectedHosts,
  hostConfigs,
  provider,
  commonNetworkAdapters,
  onClose,
}: ISelectNetworkModalProps) => {
  const [configureHosts, configureHostsResult] = useConfigureHostsMutation(
    provider,
    selectedHosts,
    hostConfigs,
    onClose
  );

  const form = useSelectNetworkFormState(selectedHosts, hostConfigs, provider);

  const networkOptions = commonNetworkAdapters.map((networkAdapter) => ({
    toString: () => formatHostNetworkAdapter(networkAdapter),
    value: networkAdapter,
    props: { description: `${networkAdapter.linkSpeed} Mbps; MTU: ${networkAdapter.mtu}` },
  }));

  return (
    <Modal
      className="selectNetworkModal"
      variant="small"
      title="Select migration network"
      isOpen
      onClose={onClose}
      footer={
        <Stack hasGutter>
          <QueryResultStatus
            results={[configureHostsResult]}
            errorTitles={['Error configuring hosts']}
          />
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              key="confirm"
              variant="primary"
              isDisabled={!form.isValid || configureHostsResult.isLoading}
              onClick={() => {
                if (form.isValid) {
                  configureHosts(form.values);
                }
              }}
            >
              Add
            </Button>
            <Button
              key="cancel"
              variant="link"
              onClick={onClose}
              isDisabled={configureHostsResult.isLoading}
            >
              Cancel
            </Button>
          </Flex>
        </Stack>
      }
      actions={[
        <Button
          key="confirm"
          variant="primary"
          isDisabled={!form.isValid || configureHostsResult.isLoading}
          onClick={() => {
            if (form.isValid) {
              configureHosts(form.values);
            }
          }}
        >
          Add
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>,
      ]}
    >
      <Form className={form.values.isReusingCredentials ? 'extraSelectMargin' : ''}>
        <FormGroup
          label="Network"
          isRequired
          fieldId="network"
          validated={form.fields.selectedNetworkAdapter.isValid ? 'default' : 'error'}
          {...getFormGroupProps(form.fields.selectedNetworkAdapter)}
        >
          <SimpleSelect
            id="network"
            aria-label="Network"
            options={networkOptions}
            value={[
              networkOptions.find(
                (option) => option.value.ipAddress === form.values.selectedNetworkAdapter?.ipAddress
              ),
            ]}
            onChange={(selection) =>
              form.fields.selectedNetworkAdapter.setValue(
                (selection as OptionWithValue<IHostNetworkAdapter>).value
              )
            }
            placeholderText="Select a network..."
          />
        </FormGroup>
        <Checkbox
          label="Reuse vSphere credentials"
          id="reuse-credentials-checkbox"
          isChecked={form.values.isReusingCredentials}
          onChange={() =>
            form.fields.isReusingCredentials.setValue(!form.values.isReusingCredentials)
          }
          className={spacing.mtMd}
        />
        {!form.values.isReusingCredentials ? (
          <>
            <ValidatedTextInput
              field={form.fields.adminUsername}
              label="Host admin username"
              isRequired
              fieldId="admin-username"
            />
            <ValidatedTextInput
              type="password"
              field={form.fields.adminPassword}
              label="Host admin password"
              isRequired
              fieldId="admin-password"
            />
          </>
        ) : null}
        {/* TODO re-enable this when we have the API capability
        <div>
          <Button variant="link" isInline icon={<ConnectedIcon />} onClick={() => alert('TODO')}>
            Check connections
          </Button>
        </div>
        */}
      </Form>
    </Modal>
  );
};

export default SelectNetworkModal;
