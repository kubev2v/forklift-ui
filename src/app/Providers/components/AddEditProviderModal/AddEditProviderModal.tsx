import * as React from 'react';
import * as yup from 'yup';
import {
  Modal,
  Button,
  Form,
  FormGroup,
  Flex,
  Stack,
  Alert,
  Checkbox,
  Popover,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  useFormState,
  useFormField,
  getFormGroupProps,
  ValidatedTextInput,
} from '@konveyor/lib-ui';

import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import {
  PRODUCT_DOCO_LINK,
  ProviderType,
  PROVIDER_TYPE_NAMES,
  urlSchema,
} from '@app/common/constants';
import { usePausedPollingEffect } from '@app/common/context';
import {
  getProviderNameSchema,
  useCreateProviderMutation,
  usePatchProviderMutation,
  useProvidersQuery,
} from '@app/queries';
import MutationStatus from '@app/common/components/MutationStatus';

import './AddEditProviderModal.css';
import { IProvidersByType, Provider } from '@app/queries/types';
import { QueryResult } from 'react-query';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import { vmwareUrlToHostname } from '@app/client/helpers';
import { HelpIcon } from '@patternfly/react-icons';

interface IAddEditProviderModalProps {
  onClose: () => void;
  providerBeingEdited: Provider | null;
}

const PROVIDER_TYPE_OPTIONS = Object.values(ProviderType).map((type) => ({
  toString: () => PROVIDER_TYPE_NAMES[type],
  value: type,
})) as OptionWithValue<ProviderType>[];

const useAddProviderFormState = (
  providersQuery: QueryResult<IProvidersByType>,
  providerBeingEdited: Provider | null
) => {
  const providerTypeField = useFormField<ProviderType | null>(
    providerBeingEdited?.type || null,
    yup.mixed().label('Provider type').oneOf(Object.values(ProviderType)).required()
  );
  const isReplacingCredentialsField = useFormField(false, yup.boolean().required());
  const areCredentialsRequired = !providerBeingEdited || isReplacingCredentialsField.value;
  const usernameSchema = yup.string().max(320).label('Username');
  const passwordSchema = yup.string().max(256).label('Password');
  const fingerprintSchema = yup
    .string()
    .label('Certificate SHA1 Fingerprint')
    .matches(/^[a-fA-F0-9]{2}((:[a-fA-F0-9]{2}){19}|(:[a-fA-F0-9]{2}){15})$/, {
      message:
        'Fingerprint must consist of 16 or 20 pairs of hexadecimal characters separated by colons, e.g. XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX',
      excludeEmptyString: true,
    });
  const saTokenSchema = yup.string().label('Service account token');

  return {
    [ProviderType.vsphere]: useFormState({
      providerType: providerTypeField,
      isReplacingCredentials: isReplacingCredentialsField,
      name: useFormField(
        providerBeingEdited?.name || '',
        getProviderNameSchema(providersQuery, ProviderType.vsphere, providerBeingEdited)
          .label('Name')
          .required()
      ),
      hostname: useFormField(
        vmwareUrlToHostname(providerBeingEdited?.object.spec.url || ''),
        yup.string().max(255).label('Hostname').required()
      ),
      fingerprint: useFormField(
        '',
        areCredentialsRequired ? fingerprintSchema.required() : fingerprintSchema
      ),
      fingerprintFilename: useFormField('', yup.string()),
      username: useFormField(
        '',
        areCredentialsRequired ? usernameSchema.required() : usernameSchema
      ),
      password: useFormField(
        '',
        areCredentialsRequired ? passwordSchema.required() : passwordSchema
      ),
    }),
    [ProviderType.openshift]: useFormState({
      providerType: providerTypeField,
      isReplacingCredentials: isReplacingCredentialsField,
      clusterName: useFormField(
        providerBeingEdited?.name || '',
        getProviderNameSchema(providersQuery, ProviderType.openshift, providerBeingEdited)
          .label('Cluster name')
          .required()
      ),
      url: useFormField(
        providerBeingEdited?.object.spec.url || '',
        urlSchema.label('URL').required()
      ),
      saToken: useFormField('', areCredentialsRequired ? saTokenSchema.required() : saTokenSchema),
    }),
  };
};

type AddProviderFormState = ReturnType<typeof useAddProviderFormState>; // ✨ Magic
export type VMwareProviderFormValues = AddProviderFormState[ProviderType.vsphere]['values'];
export type OpenshiftProviderFormValues = AddProviderFormState[ProviderType.openshift]['values'];
export type AddProviderFormValues = VMwareProviderFormValues | OpenshiftProviderFormValues;

const AddEditProviderModal: React.FunctionComponent<IAddEditProviderModalProps> = ({
  onClose,
  providerBeingEdited,
}: IAddEditProviderModalProps) => {
  usePausedPollingEffect();

  const providersQuery = useProvidersQuery();

  const forms = useAddProviderFormState(providersQuery, providerBeingEdited);
  const vmwareForm = forms[ProviderType.vsphere];
  const openshiftForm = forms[ProviderType.openshift];
  const providerTypeField = vmwareForm.fields.providerType;
  const providerType = providerTypeField.value;
  const formValues = providerType ? forms[providerType].values : vmwareForm.values;
  const isFormValid = providerType ? forms[providerType].isValid : false;

  const [createProvider, createProviderResult] = useCreateProviderMutation(providerType, onClose);
  const [patchProvider, patchProviderResult] = usePatchProviderMutation(
    providerType,
    providerBeingEdited,
    onClose
  );
  const mutateProvider = !providerBeingEdited ? createProvider : patchProvider;
  const mutateProviderResult = !providerBeingEdited ? createProviderResult : patchProviderResult;

  const replaceCredentialsCheckbox = (
    <Checkbox
      label="Replace credentials"
      id="replace-credentials-checkbox"
      isChecked={vmwareForm.values.isReplacingCredentials}
      onChange={() =>
        vmwareForm.fields.isReplacingCredentials.setValue(!vmwareForm.values.isReplacingCredentials)
      }
      className={spacing.mtMd}
    />
  );

  return (
    <Modal
      className="AddEditProviderModal"
      variant="small"
      title={`${!providerBeingEdited ? 'Add' : 'Edit'} provider`}
      isOpen
      onClose={onClose}
      footer={
        <Stack hasGutter>
          <MutationStatus
            results={[mutateProviderResult]}
            errorTitles={[`Error ${!providerBeingEdited ? 'adding' : 'editing'} provider`]}
          />
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              key="confirm"
              variant="primary"
              isDisabled={!isFormValid || mutateProviderResult.isLoading}
              onClick={() => {
                mutateProvider(formValues);
              }}
            >
              {!providerBeingEdited ? 'Add' : 'Save'}
            </Button>
            <Button
              key="cancel"
              variant="link"
              onClick={onClose}
              isDisabled={mutateProviderResult.isLoading}
            >
              Cancel
            </Button>
          </Flex>
        </Stack>
      }
    >
      {providersQuery.isLoading ? (
        <LoadingEmptyState />
      ) : providersQuery.isError ? (
        <Alert variant="danger" isInline title="Error loading providers" />
      ) : (
        <Form>
          <FormGroup
            label="Type"
            isRequired
            fieldId="provider-type"
            className={!providerType ? 'extraSelectMargin' : ''}
            {...getFormGroupProps(providerTypeField)}
          >
            <SimpleSelect
              id="provider-type"
              aria-label="Provider type"
              options={PROVIDER_TYPE_OPTIONS}
              value={[PROVIDER_TYPE_OPTIONS.find((option) => option.value === providerType)]}
              onChange={(selection) => {
                providerTypeField.setValue((selection as OptionWithValue<ProviderType>).value);
                providerTypeField.setIsTouched(true);
              }}
              placeholderText="Select a provider type..."
              isDisabled={!!providerBeingEdited}
            />
          </FormGroup>
          {providerType === ProviderType.vsphere ? (
            <>
              <ValidatedTextInput
                field={vmwareForm.fields.name}
                label="Name"
                isRequired
                fieldId="vmware-name"
                inputProps={{
                  isDisabled: !!providerBeingEdited,
                }}
                formGroupProps={{
                  labelIcon: (
                    <Popover bodyContent="The name to provide on the providers list screen.">
                      <button
                        aria-label="More info for name field"
                        onClick={(e) => e.preventDefault()}
                        aria-describedby="vmware-name-info"
                        className="pf-c-form__group-label-help"
                      >
                        <HelpIcon noVerticalAlign />
                      </button>
                    </Popover>
                  ),
                }}
              />
              <ValidatedTextInput
                field={vmwareForm.fields.hostname}
                label="Hostname or IP address"
                isRequired
                fieldId="vmware-hostname"
              />
              {providerBeingEdited ? replaceCredentialsCheckbox : null}
              {!providerBeingEdited || vmwareForm.values.isReplacingCredentials ? (
                <>
                  <ValidatedTextInput
                    field={vmwareForm.fields.username}
                    label="Username"
                    isRequired
                    fieldId="vmware-username"
                  />
                  <ValidatedTextInput
                    field={vmwareForm.fields.password}
                    type="password"
                    label="Password"
                    isRequired
                    fieldId="vmware-password"
                  />
                  <ValidatedTextInput
                    field={vmwareForm.fields.fingerprint}
                    label="Certificate SHA1 Fingerprint"
                    isRequired
                    fieldId="vmware-fingerprint"
                    formGroupProps={{
                      labelIcon: (
                        <Popover
                          bodyContent={
                            <div>
                              See{' '}
                              <a href={PRODUCT_DOCO_LINK.href} target="_blank" rel="noreferrer">
                                {PRODUCT_DOCO_LINK.label}
                              </a>{' '}
                              for instructions on how to retrieve the fingerprint.
                            </div>
                          }
                        >
                          <button
                            aria-label="More info for SHA1 Fingerprint field"
                            onClick={(e) => e.preventDefault()}
                            aria-describedby="vmware-fingerprint"
                            className="pf-c-form__group-label-help"
                          >
                            <HelpIcon noVerticalAlign />
                          </button>
                        </Popover>
                      ),
                    }}
                  />
                </>
              ) : null}
            </>
          ) : null}
          {providerType === ProviderType.openshift ? (
            <>
              <ValidatedTextInput
                field={openshiftForm.fields.clusterName}
                label="Name"
                isRequired
                fieldId="openshift-cluster-name"
                inputProps={{
                  isDisabled: !!providerBeingEdited,
                }}
                formGroupProps={{
                  labelIcon: (
                    <Popover bodyContent="The name to provide on the providers list screen.">
                      <button
                        aria-label="More info for name field"
                        onClick={(e) => e.preventDefault()}
                        aria-describedby="openshift-cluster-name-info"
                        className="pf-c-form__group-label-help"
                      >
                        <HelpIcon noVerticalAlign />
                      </button>
                    </Popover>
                  ),
                }}
              />
              <ValidatedTextInput
                field={openshiftForm.fields.url}
                label="URL"
                isRequired
                fieldId="openshift-url"
                formGroupProps={{
                  labelIcon: (
                    <Popover
                      bodyContent={
                        <>
                          The OpenShift cluster API endpoint.
                          <br />
                          For example: <i>https://api.clusterName.domain:6443</i>
                        </>
                      }
                    >
                      <button
                        aria-label="More info for URL field"
                        onClick={(e) => e.preventDefault()}
                        aria-describedby="openshift-cluster-url-info"
                        className="pf-c-form__group-label-help"
                      >
                        <HelpIcon noVerticalAlign />
                      </button>
                    </Popover>
                  ),
                }}
              />
              {providerBeingEdited ? replaceCredentialsCheckbox : null}
              {!providerBeingEdited || openshiftForm.values.isReplacingCredentials ? (
                <ValidatedTextInput
                  field={openshiftForm.fields.saToken}
                  type="password"
                  label="Service account token"
                  isRequired
                  fieldId="openshift-sa-token"
                  formGroupProps={{
                    labelIcon: (
                      <Popover
                        bodyContent={
                          <>
                            To obtain SA token, run the following command:
                            <br />
                            <i>
                              $ oc serviceaccounts get-token serviceaccount_name -n namespace_name
                            </i>
                            <br />
                            <br />
                            <b>** Be sure to use the namespace in which you created the SA.</b>
                          </>
                        }
                      >
                        <button
                          aria-label="More info for service account field"
                          onClick={(e) => e.preventDefault()}
                          aria-describedby="service-account-info"
                          className="pf-c-form__group-label-help"
                        >
                          <HelpIcon noVerticalAlign />
                        </button>
                      </Popover>
                    ),
                  }}
                />
              ) : null}
            </>
          ) : null}
          {/* TODO re-enable this when we have the API capability
        providerType ? (
          <div>
            <Button variant="link" isInline icon={<ConnectedIcon />} onClick={() => alert('TODO')}>
              Check connection
            </Button>
          </div>
        ) : null
        */}
        </Form>
      )}
    </Modal>
  );
};

export default AddEditProviderModal;
