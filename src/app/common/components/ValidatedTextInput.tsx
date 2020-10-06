import * as React from 'react';
import {
  FormGroup,
  FormGroupProps,
  TextArea,
  TextAreaProps,
  TextInput,
  TextInputProps,
} from '@patternfly/react-core';
import { IValidatedFormField, getFormGroupProps, getTextFieldProps } from '../hooks/useFormState';

interface IValidatedTextInputProps
  extends Pick<FormGroupProps, 'label' | 'fieldId' | 'isRequired'>,
    Pick<TextInputProps, 'type'> {
  field: IValidatedFormField<string>;
  component?: typeof TextInput | typeof TextArea;
  formGroupProps?: Partial<FormGroupProps>;
  inputProps?: Partial<TextInputProps> | Partial<TextAreaProps>;
}

const ValidatedTextInput: React.FunctionComponent<IValidatedTextInputProps> = ({
  field,
  component = TextInput,
  label,
  fieldId,
  isRequired,
  type = 'text',
  formGroupProps = {},
  inputProps = {},
}: IValidatedTextInputProps) => (
  <FormGroup
    label={label}
    isRequired={isRequired}
    fieldId={fieldId}
    {...getFormGroupProps(field)}
    {...formGroupProps}
  >
    {component === TextInput ? (
      <TextInput
        id={fieldId}
        type={type}
        {...(getTextFieldProps(field) as Partial<TextInputProps>)}
        {...(inputProps as Partial<TextInputProps>)}
      />
    ) : (
      <TextArea
        id={fieldId}
        {...(getTextFieldProps(field) as Partial<TextAreaProps>)}
        {...(inputProps as Partial<TextAreaProps>)}
        ref={null} // Necessary because of some weird TS issue with spreading Partial<TextAreaProps>['ref']
      />
    )}
  </FormGroup>
);

export default ValidatedTextInput;
