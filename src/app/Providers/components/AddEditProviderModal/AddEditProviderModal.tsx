import * as React from 'react';
import * as yup from 'yup';
import { Modal, Button, Form, FormGroup, Flex, Stack, Popover } from '@patternfly/react-core';
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
  vmwareFingerprintSchema,
  vmwareHostnameSchema,
  vmwareUsernameSchema,
} from '@app/common/constants';
import { usePausedPollingEffect } from '@app/common/context';
import {
  getProviderNameSchema,
  useCreateProviderMutation,
  usePatchProviderMutation,
  useClusterProvidersQuery,
} from '@app/queries';

import './AddEditProviderModal.css';
import { IProviderObject } from '@app/queries/types';
import { QueryResult } from 'react-query';
import { HelpIcon } from '@patternfly/react-icons';
import { QuerySpinnerMode, ResolvedQuery } from '@app/common/components/ResolvedQuery';
import { IKubeList } from '@app/client/types';
import { useEditProviderPrefillEffect } from './helpers';
import LoadingEmptyState from '@app/common/components/LoadingEmptyState';
import ValidatedPasswordInput from '@app/common/components/ValidatedPasswordInput';

interface IAddEditProviderModalProps {
  onClose: (navToProviderType?: ProviderType | null) => void;
  providerBeingEdited: IProviderObject | null;
}

const PROVIDER_TYPE_OPTIONS = Object.values(ProviderType).map((type) => ({
  toString: () => PROVIDER_TYPE_NAMES[type],
  value: type,
})) as OptionWithValue<ProviderType>[];

const useAddProviderFormState = (
  clusterProvidersQuery: QueryResult<IKubeList<IProviderObject>>,
  providerBeingEdited: IProviderObject | null
) => {
  const providerTypeField = useFormField<ProviderType | null>(
    null,
    yup.mixed().label('Provider type').oneOf(Object.values(ProviderType)).required()
  );

  return {
    [ProviderType.vsphere]: useFormState({
      providerType: providerTypeField,
      name: useFormField(
        '',
        getProviderNameSchema(clusterProvidersQuery, providerBeingEdited).label('Name').required()
      ),
      hostname: useFormField('', vmwareHostnameSchema),
      username: useFormField('', vmwareUsernameSchema.required()),
      password: useFormField('', yup.string().max(256).label('Password').required()),
      fingerprint: useFormField('', vmwareFingerprintSchema.required()),
      fingerprintFilename: useFormField('', yup.string()),
    }),
    [ProviderType.openshift]: useFormState({
      providerType: providerTypeField,
      name: useFormField(
        '',
        getProviderNameSchema(clusterProvidersQuery, providerBeingEdited).label('Name').required()
      ),
      url: useFormField('', urlSchema.label('URL').required()),
      saToken: useFormField('', yup.string().label('Service account token').required()),
    }),
  };
};

export type AddProviderFormState = ReturnType<typeof useAddProviderFormState>; // ✨ Magic
export type VMwareProviderFormValues = AddProviderFormState[ProviderType.vsphere]['values'];
export type OpenshiftProviderFormValues = AddProviderFormState[ProviderType.openshift]['values'];
export type AddProviderFormValues = VMwareProviderFormValues | OpenshiftProviderFormValues;

const AddEditProviderModal: React.FunctionComponent<IAddEditProviderModalProps> = ({
  onClose,
  providerBeingEdited,
}: IAddEditProviderModalProps) => {
  usePausedPollingEffect();

  const clusterProvidersQuery = useClusterProvidersQuery();

  const forms = useAddProviderFormState(clusterProvidersQuery, providerBeingEdited);

  const { isDonePrefilling } = useEditProviderPrefillEffect(forms, providerBeingEdited);

  const vmwareForm = forms[ProviderType.vsphere];
  const openshiftForm = forms[ProviderType.openshift];
  const providerTypeField = vmwareForm.fields.providerType;
  const providerType = providerTypeField.value;
  const formValues = providerType ? forms[providerType].values : vmwareForm.values;
  const isFormValid = providerType ? forms[providerType].isValid : false;
  const isFormDirty = providerType ? forms[providerType].isDirty : false;

  const [createProvider, createProviderResult] = useCreateProviderMutation(providerType, onClose);
  const [patchProvider, patchProviderResult] = usePatchProviderMutation(
    providerType,
    providerBeingEdited,
    onClose
  );
  const mutateProvider = !providerBeingEdited ? createProvider : patchProvider;
  const mutateProviderResult = !providerBeingEdited ? createProviderResult : patchProviderResult;

  return (
    <Modal
      className="AddEditProviderModal"
      variant="small"
      title={`${!providerBeingEdited ? 'Add' : 'Edit'} provider`}
      isOpen
      onClose={onClose}
      footer={
        <Stack hasGutter>
          <ResolvedQuery
            result={mutateProviderResult}
            errorTitle={`Error ${!providerBeingEdited ? 'adding' : 'editing'} provider`}
            spinnerMode={QuerySpinnerMode.Inline}
          />
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              id="modal-confirm-button"
              key="confirm"
              variant="primary"
              isDisabled={!isFormDirty || !isFormValid || mutateProviderResult.isLoading}
              onClick={() => {
                mutateProvider(formValues);
              }}
            >
              {!providerBeingEdited ? 'Add' : 'Save'}
            </Button>
            <Button
              id="modal-cancel-button"
              key="cancel"
              variant="link"
              onClick={() => onClose()}
              isDisabled={mutateProviderResult.isLoading}
            >
              Cancel
            </Button>
          </Flex>
        </Stack>
      }
    >
      <ResolvedQuery result={clusterProvidersQuery} errorTitle="Error loading providers">
        {!isDonePrefilling ? (
          <LoadingEmptyState />
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
                      <Popover bodyContent="User specified name that will be displayed in the UI.">
                        <Button
                          variant="plain"
                          aria-label="More info for name field"
                          onClick={(e) => e.preventDefault()}
                          aria-describedby="vmware-name-info"
                          className="pf-c-form__group-label-help"
                        >
                          <HelpIcon noVerticalAlign />
                        </Button>
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
                <ValidatedTextInput
                  field={vmwareForm.fields.username}
                  label="Username"
                  isRequired
                  fieldId="vmware-username"
                />
                <ValidatedPasswordInput
                  field={vmwareForm.fields.password}
                  label="Password"
                  isRequired
                  fieldId="vmware-password"
                />
                <ValidatedTextInput
                  field={vmwareForm.fields.fingerprint}
                  label="SHA-1 fingerprint"
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
                        <Button
                          variant="plain"
                          aria-label="More info for SHA-1 fingerprint field"
                          onClick={(e) => e.preventDefault()}
                          aria-describedby="vmware-fingerprint"
                          className="pf-c-form__group-label-help"
                        >
                          <HelpIcon noVerticalAlign />
                        </Button>
                      </Popover>
                    ),
                  }}
                />
              </>
            ) : null}
            {providerType === ProviderType.openshift ? (
              <>
                <ValidatedTextInput
                  field={openshiftForm.fields.name}
                  label="Name"
                  isRequired
                  fieldId="openshift-name"
                  inputProps={{
                    isDisabled: !!providerBeingEdited,
                  }}
                  formGroupProps={{
                    labelIcon: (
                      <Popover bodyContent="User specified name that will be displayed in the UI.">
                        <Button
                          variant="plain"
                          aria-label="More info for name field"
                          onClick={(e) => e.preventDefault()}
                          aria-describedby="openshift-name-info"
                          className="pf-c-form__group-label-help"
                        >
                          <HelpIcon noVerticalAlign />
                        </Button>
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
                            OpenShift cluster API endpoint.
                            <br />
                            For example: <i>https://api.clusterName.domain:6443</i>
                          </>
                        }
                      >
                        <Button
                          variant="plain"
                          aria-label="More info for URL field"
                          onClick={(e) => e.preventDefault()}
                          aria-describedby="openshift-cluster-url-info"
                          className="pf-c-form__group-label-help"
                        >
                          <HelpIcon noVerticalAlign />
                        </Button>
                      </Popover>
                    ),
                  }}
                />
                <ValidatedPasswordInput
                  field={openshiftForm.fields.saToken}
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
                        <Button
                          variant="plain"
                          aria-label="More info for service account field"
                          onClick={(e) => e.preventDefault()}
                          aria-describedby="service-account-info"
                          className="pf-c-form__group-label-help"
                        >
                          <HelpIcon noVerticalAlign />
                        </Button>
                      </Popover>
                    ),
                  }}
                />
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
      </ResolvedQuery>
    </Modal>
  );
};

export default AddEditProviderModal;
