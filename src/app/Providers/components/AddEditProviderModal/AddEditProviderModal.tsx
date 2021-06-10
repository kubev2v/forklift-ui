import * as React from 'react';
import * as yup from 'yup';
import {
  Modal,
  Button,
  Form,
  FormGroup,
  Flex,
  Stack,
  Popover,
  FileUpload,
} from '@patternfly/react-core';
import {
  useFormState,
  useFormField,
  getFormGroupProps,
  ValidatedTextInput,
} from '@konveyor/lib-ui';

import SimpleSelect, { OptionWithValue } from '@app/common/components/SimpleSelect';
import {
  fingerprintSchema,
  hostnameSchema,
  PRODUCT_DOCO_LINK,
  ProviderType,
  PROVIDER_TYPES,
  PROVIDER_TYPE_NAMES,
  urlSchema,
  usernameSchema,
} from '@app/common/constants';
import { usePausedPollingEffect } from '@app/common/context';
import {
  getProviderNameSchema,
  useCreateProviderMutation,
  usePatchProviderMutation,
  useClusterProvidersQuery,
} from '@app/queries';

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

const PROVIDER_TYPE_OPTIONS = PROVIDER_TYPES.map((type) => ({
  toString: () => PROVIDER_TYPE_NAMES[type],
  value: type,
})) as OptionWithValue<ProviderType>[];

const useAddProviderFormState = (
  clusterProvidersQuery: QueryResult<IKubeList<IProviderObject>>,
  providerBeingEdited: IProviderObject | null
) => {
  const providerTypeField = useFormField<ProviderType | null>(
    null,
    yup
      .mixed()
      .label('Provider type')
      .oneOf([...PROVIDER_TYPES]) // Spread necessary because readonly array isn't assignable to mutable any[]
      .required()
  );

  const commonProviderFields = {
    providerType: providerTypeField,
    name: useFormField(
      '',
      getProviderNameSchema(clusterProvidersQuery, providerBeingEdited).label('Name').required()
    ),
  };

  const sourceProviderFields = {
    ...commonProviderFields,
    hostname: useFormField('', hostnameSchema),
    username: useFormField('', usernameSchema.required()),
    password: useFormField('', yup.string().max(256).label('Password').required()),
  };

  return {
    vsphere: useFormState({
      ...sourceProviderFields,
      fingerprint: useFormField('', fingerprintSchema.required()),
      fingerprintFilename: useFormField('', yup.string()),
    }),
    ovirt: useFormState({
      ...sourceProviderFields,
      caCert: useFormField('', yup.string().label('CA certificate').required()),
      caCertFilename: useFormField('', yup.string()),
    }),
    openshift: useFormState({
      ...commonProviderFields,
      url: useFormField('', urlSchema.label('URL').required()),
      saToken: useFormField('', yup.string().label('Service account token').required()),
    }),
  };
};

export type AddProviderFormState = ReturnType<typeof useAddProviderFormState>; // ✨ Magic
export type VMwareProviderFormValues = AddProviderFormState['vsphere']['values'];
export type RHVProviderFormValues = AddProviderFormState['ovirt']['values'];
export type OpenshiftProviderFormValues = AddProviderFormState['openshift']['values'];
export type AddProviderFormValues =
  | VMwareProviderFormValues
  | RHVProviderFormValues
  | OpenshiftProviderFormValues;

const AddEditProviderModal: React.FunctionComponent<IAddEditProviderModalProps> = ({
  onClose,
  providerBeingEdited,
}: IAddEditProviderModalProps) => {
  usePausedPollingEffect();

  const clusterProvidersQuery = useClusterProvidersQuery();

  const forms = useAddProviderFormState(clusterProvidersQuery, providerBeingEdited);

  const { isDonePrefilling } = useEditProviderPrefillEffect(forms, providerBeingEdited);

  const providerTypeField = forms.vsphere.fields.providerType;
  const providerType = providerTypeField.value;
  const formValues = providerType ? forms[providerType].values : null;
  const isFormValid = providerType ? forms[providerType].isValid : false;
  const isFormDirty = providerType ? forms[providerType].isDirty : false;

  // Combines fields of all 3 forms into one type with all properties as optional.
  // This way, we can conditionally show fields based on whether they are defined in form state
  // instead of duplicating the logic of which providers have which fields.
  const fields = providerType
    ? (forms[providerType].fields as Partial<
        typeof forms.vsphere.fields & typeof forms.ovirt.fields & typeof forms.openshift.fields
      >)
    : null;

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
      onClose={() => onClose()}
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
                if (formValues) {
                  mutateProvider(formValues);
                }
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
                menuAppendTo="parent"
                maxHeight="40vh"
              />
            </FormGroup>
            {providerType ? (
              <>
                {fields?.name ? (
                  <ValidatedTextInput
                    field={forms[providerType].fields.name}
                    label="Name"
                    isRequired
                    fieldId="name"
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
                            aria-describedby="name-info"
                            className="pf-c-form__group-label-help"
                          >
                            <HelpIcon noVerticalAlign />
                          </Button>
                        </Popover>
                      ),
                    }}
                  />
                ) : null}
                {fields?.hostname ? (
                  <ValidatedTextInput
                    field={fields.hostname}
                    label="Hostname or IP address"
                    isRequired
                    fieldId="hostname"
                  />
                ) : null}
                {fields?.username ? (
                  <ValidatedTextInput
                    field={fields.username}
                    label="Username"
                    isRequired
                    fieldId="username"
                  />
                ) : null}
                {fields?.password ? (
                  <ValidatedPasswordInput
                    field={fields.password}
                    label="Password"
                    isRequired
                    fieldId="password"
                  />
                ) : null}
                {fields?.fingerprint ? (
                  <ValidatedTextInput
                    field={fields.fingerprint}
                    label="SHA-1 fingerprint"
                    isRequired
                    fieldId="fingerprint"
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
                            aria-describedby="fingerprint"
                            className="pf-c-form__group-label-help"
                          >
                            <HelpIcon noVerticalAlign />
                          </Button>
                        </Popover>
                      ),
                    }}
                  />
                ) : null}
                {fields?.caCert && fields?.caCertFilename ? (
                  <FormGroup
                    label="CA certificate"
                    labelIcon={
                      <Popover
                        bodyContent={
                          <div>
                            See{' '}
                            <a href={PRODUCT_DOCO_LINK.href} target="_blank" rel="noreferrer">
                              {PRODUCT_DOCO_LINK.label}
                            </a>{' '}
                            for instructions on how to retrieve the CA certificate.
                          </div>
                        }
                      >
                        <Button
                          variant="plain"
                          aria-label="More info for CA certificate field"
                          onClick={(e) => e.preventDefault()}
                          aria-describedby="caCert"
                          className="pf-c-form__group-label-help"
                        >
                          <HelpIcon noVerticalAlign />
                        </Button>
                      </Popover>
                    }
                    fieldId="caCert"
                    {...getFormGroupProps(fields.caCert)}
                  >
                    <FileUpload
                      id="caCert"
                      type="text"
                      value={fields.caCert.value}
                      filename={fields.caCertFilename.value}
                      onChange={(value, filename) => {
                        fields.caCert?.setValue(value as string);
                        fields.caCert?.setIsTouched(true);
                        fields.caCertFilename?.setValue(filename);
                      }}
                      onBlur={() => fields.caCert?.setIsTouched(true)}
                      validated={fields.caCert?.isValid ? 'default' : 'error'}
                    />
                  </FormGroup>
                ) : null}
                {fields?.url ? (
                  <ValidatedTextInput
                    field={fields.url}
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
                ) : null}
                {fields?.saToken ? (
                  <ValidatedPasswordInput
                    field={fields.saToken}
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
              </>
            ) : null}
          </Form>
        )}
      </ResolvedQuery>
    </Modal>
  );
};

export default AddEditProviderModal;
