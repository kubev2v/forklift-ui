import * as React from 'react';
import * as yup from 'yup';
import { Modal, Button, Form, FormGroup, Stack, Flex } from '@patternfly/react-core';
import {
  useFormState,
  useFormField,
  getFormGroupProps,
  ValidatedTextInput,
} from '@konveyor/lib-ui';

import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { IHost, IHostConfig, IHostNetworkAdapter, IVMwareProvider } from '@app/queries/types';

import { formatHostNetworkAdapter, usePrefillHostConfigEffect } from './helpers';
import { useConfigureHostsMutation } from '@app/queries';
import { QuerySpinnerMode, ResolvedQuery } from '@app/common/components/ResolvedQuery';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';

interface ISelectNetworkModalProps {
  selectedHosts: IHost[];
  hostConfigs: IHostConfig[];
  provider: IVMwareProvider;
  commonNetworkAdapters: IHostNetworkAdapter[];
  onClose: () => void;
}

const useSelectNetworkFormState = () =>
  useFormState({
    selectedNetworkAdapter: useFormField<IHostNetworkAdapter | null>(
      null,
      yup.mixed<IHostNetworkAdapter>().label('Host network').required()
    ),
    adminUsername: useFormField('', yup.string().max(320).label('Host admin username').required()),
    adminPassword: useFormField('', yup.string().max(256).label('Host admin password').required()),
  });
export type SelectNetworkFormState = ReturnType<typeof useSelectNetworkFormState>;
export type SelectNetworkFormValues = SelectNetworkFormState['values'];

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

  const form = useSelectNetworkFormState();
  const { isDonePrefilling } = usePrefillHostConfigEffect(
    form,
    selectedHosts,
    hostConfigs,
    provider
  );

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
          <ResolvedQuery
            result={configureHostsResult}
            errorTitle="Error configuring hosts"
            spinnerMode={QuerySpinnerMode.Inline}
          />
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              key="confirm"
              variant="primary"
              isDisabled={!form.isDirty || !form.isValid || configureHostsResult.isLoading}
              onClick={() => {
                if (form.isValid) {
                  configureHosts(form.values);
                }
              }}
            >
              Save
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
          isDisabled={!form.isDirty || !form.isValid || configureHostsResult.isLoading}
          onClick={() => {
            if (form.isValid) {
              configureHosts(form.values);
            }
          }}
        >
          Add
        </Button>,
        <Button
          key="cancel"
          variant="link"
          onClick={onClose}
          isDisabled={configureHostsResult.isLoading}
        >
          Cancel
        </Button>,
      ]}
    >
      {!isDonePrefilling ? (
        <LoadingEmptyState />
      ) : (
        <Form>
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
                  (option) =>
                    option.value.ipAddress === form.values.selectedNetworkAdapter?.ipAddress
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
          {/* TODO re-enable this when we have the API capability
        <div>
          <Button variant="link" isInline icon={<ConnectedIcon />} onClick={() => alert('TODO')}>
            Check connections
          </Button>
        </div>
        */}
        </Form>
      )}
    </Modal>
  );
};

export default SelectNetworkModal;
