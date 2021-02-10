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
import { IOpenShiftNetwork, IOpenShiftProvider, POD_NETWORK } from '@app/queries/types';

import { MOCK_OPENSHIFT_NETWORKS } from '@app/queries/mocks/networks.mock';
import { isSameResource } from '@app/queries/helpers';

import './SelectOpenShiftNetworkModal.css';
import { MutationResult } from 'react-query';
import { IKubeResponse, IKubeStatus, KubeClientError } from '@app/client/types';
import { QuerySpinnerMode, ResolvedQuery } from './ResolvedQuery';
import { useOpenShiftNetworksQuery } from '@app/queries/networks';

interface ISelectOpenShiftNetworkModalProps {
  targetProvider: IOpenShiftProvider | null;
  instructions: string;
  onClose: () => void;
  onSubmit: (network: IOpenShiftNetwork | null) => void;
  mutationResult?: MutationResult<IKubeResponse<IKubeStatus>, KubeClientError>;
}

const useSelectNetworkFormState = () =>
  useFormState({
    selectedNetwork: useFormField<IOpenShiftNetwork | null>(
      null,
      yup.mixed<IOpenShiftNetwork>().label('Migration network').required()
    ),
  });

const SelectOpenShiftNetworkModal: React.FunctionComponent<ISelectOpenShiftNetworkModalProps> = ({
  targetProvider,
  instructions,
  onClose,
  onSubmit,
  mutationResult,
}: ISelectOpenShiftNetworkModalProps) => {
  const form = useSelectNetworkFormState();
  const networksQuery = useOpenShiftNetworksQuery(targetProvider);
  const networks = [POD_NETWORK, ...(networksQuery.data || [])];
  const networkOptions = networks.map((network) => ({
    toString: () => network.name,
    value: network,
  }));

  return (
    <Modal
      className="SelectOpenShiftNetworkModal"
      variant="small"
      title="Select migration network"
      isOpen
      onClose={onClose}
      footer={
        <Stack hasGutter>
          {mutationResult ? (
            <ResolvedQuery
              result={mutationResult}
              errorTitle="Error setting migration network"
              spinnerMode={QuerySpinnerMode.Inline}
            />
          ) : null}
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              key="confirm"
              variant="primary"
              isDisabled={!form.isDirty || !form.isValid || mutationResult?.isLoading}
              onClick={() => {
                onSubmit(form.values.selectedNetwork);
              }}
            >
              Select
            </Button>
            <Button
              key="cancel"
              variant="link"
              onClick={onClose}
              isDisabled={mutationResult?.isLoading}
            >
              Cancel
            </Button>
          </Flex>
        </Stack>
      }
    >
      <ResolvedQuery result={networksQuery} errorTitle="Error loading networks">
        <Form>
          <TextContent>
            <Text component="p">{instructions}</Text>
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
      </ResolvedQuery>
    </Modal>
  );
};

export default SelectOpenShiftNetworkModal;
