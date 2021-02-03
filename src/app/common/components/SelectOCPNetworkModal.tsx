import * as React from 'react';
import * as yup from 'yup';
import {
  Modal,
  Button,
  Form,
  FormGroup,
  Stack,
  Flex,
  TextContent,
  Text,
} from '@patternfly/react-core';
import { useFormState, useFormField, getFormGroupProps } from '@konveyor/lib-ui';

import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import { IOpenShiftNetwork, IOpenShiftProvider } from '@app/queries/types';

import { MOCK_OPENSHIFT_NETWORKS } from '@app/queries/mocks/networks.mock';
import { isSameResource } from '@app/queries/helpers';

import './SelectOCPNetworkModal.css';

interface ISelectOCPNetworkModalProps {
  targetProvider: IOpenShiftProvider | null;
  onClose: () => void;
}

const useSelectNetworkFormState = () =>
  useFormState({
    selectedNetwork: useFormField<IOpenShiftNetwork | null>(
      null,
      yup.mixed<IOpenShiftNetwork>().label('Migration network').required()
    ),
  });

const SelectOCPNetworkModal: React.FunctionComponent<ISelectOCPNetworkModalProps> = ({
  onClose,
}: ISelectOCPNetworkModalProps) => {
  const form = useSelectNetworkFormState();

  // TODO query networks of this provider
  const networkOptions = MOCK_OPENSHIFT_NETWORKS.map((network) => ({
    toString: () => network.name,
    value: network,
  }));

  return (
    <Modal
      className="SelectOCPNetworkModal"
      variant="small"
      title="Select migration network"
      isOpen
      onClose={onClose}
      footer={
        <Stack hasGutter>
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              key="confirm"
              variant="primary"
              isDisabled={!form.isDirty || !form.isValid /* || configureHostsResult.isLoading*/}
              onClick={() => {
                alert('TODO');
              }}
            >
              Select
            </Button>
            <Button
              key="cancel"
              variant="link"
              onClick={onClose}
              // isDisabled={configureHostsResult.isLoading}
            >
              Cancel
            </Button>
          </Flex>
        </Stack>
      }
    >
      <Form>
        <TextContent>
          <Text component="p">
            Select the network that will be used for migrating data to the namespace.
          </Text>
        </TextContent>
        <FormGroup
          isRequired
          fieldId="network"
          validated={form.fields.selectedNetwork.isValid ? 'default' : 'error'}
          {...getFormGroupProps(form.fields.selectedNetwork)}
          className="extraSelectMargin"
        >
          <SimpleSelect
            id="network"
            aria-label="Migration network"
            options={networkOptions}
            value={[
              networkOptions.find((option) =>
                isSameResource(option.value, form.values.selectedNetwork)
              ),
            ]}
            onChange={(selection) =>
              form.fields.selectedNetwork.setValue(
                (selection as OptionWithValue<IOpenShiftNetwork>).value
              )
            }
            placeholderText="Select a network..."
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

export default SelectOCPNetworkModal;
