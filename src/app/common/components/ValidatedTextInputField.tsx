import * as React from 'react';
import { FormGroup, FormGroupProps, TextInput, TextInputProps } from '@patternfly/react-core';
import { IValidatedFormField, getFormGroupProps, getTextInputProps } from '../hooks/useFormState';

interface IValidatedTextInputFieldProps
  extends Pick<FormGroupProps, 'label' | 'fieldId' | 'isRequired'>,
    Pick<TextInputProps, 'type'> {
  field: IValidatedFormField<string>;
  formGroupProps?: Partial<FormGroupProps>;
  textInputProps?: Partial<TextInputProps>;
}

const ValidatedTextInputField: React.FunctionComponent<IValidatedTextInputFieldProps> = ({
  field,
  label,
  fieldId,
  isRequired,
  type = 'text',
  formGroupProps = {},
  textInputProps = {},
}: IValidatedTextInputFieldProps) => (
  <FormGroup
    label={label}
    isRequired={isRequired}
    fieldId={fieldId}
    {...getFormGroupProps(field)}
    {...formGroupProps}
  >
    <TextInput id={fieldId} type={type} {...getTextInputProps(field)} {...textInputProps} />
  </FormGroup>
);

export default ValidatedTextInputField;
