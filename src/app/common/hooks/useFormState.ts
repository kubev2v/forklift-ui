import { FormGroupProps, TextInputProps } from '@patternfly/react-core';
import * as React from 'react';
import * as yup from 'yup';

interface IFormFieldArgs<T> {
  initialValue: T;
  initialTouched?: boolean;
  schema: yup.Schema<T>;
}

export interface IFormField<T> {
  value: T;
  setValue: (value: T) => void;
  touched: boolean;
  setTouched: (touched: boolean) => void;
  reset: () => void;
  schema: yup.Schema<T>;
}

export interface IValidatedFormField<T> extends IFormField<T> {
  error: yup.ValidationError | null;
  isValid: boolean;
}

type FormFields<FormValues> = {
  [key in keyof FormValues]: IFormField<FormValues[key]>;
};

type ValidatedFormFields<FormValues> = {
  [key in keyof FormValues]: IValidatedFormField<FormValues[key]>;
};

export interface IFormState<FormValues> {
  fields: ValidatedFormFields<FormValues>;
  values: FormValues; // For convenience in submitting forms (values are also included in fields property)
  isValid: boolean;
  reset: () => void;
  schema: yup.ObjectSchema; // In case you want to do anything fancy outside the hook
}

export const useFormField = <T>({
  initialValue,
  initialTouched = false,
  schema,
}: IFormFieldArgs<T>): IFormField<T> => {
  const [value, setValue] = React.useState<T>(initialValue);
  const [touched, setTouched] = React.useState<boolean>(initialTouched);
  return {
    value,
    setValue,
    touched,
    setTouched,
    reset: () => {
      setValue(initialValue);
      setTouched(initialTouched);
    },
    schema,
  };
};

// FormValues represents an interface of field key to field value type (the T in IFormField<T>).
// TypeScript can infer it from the arguments we pass to useFormState!
export const useFormState = <FormValues>(
  fields: FormFields<FormValues>,
  yupOptions: yup.ValidateOptions = {}
): IFormState<FormValues> => {
  const fieldKeys = Object.keys(fields) as (keyof FormValues)[];
  const values: FormValues = fieldKeys.reduce(
    (newObj, key) => ({ ...newObj, [key]: fields[key].value }),
    {} as FormValues
  );

  const schemaShape = fieldKeys.reduce(
    (newObj, key) => ({ ...newObj, [key]: fields[key].schema }),
    {} as { [key in keyof FormValues]?: yup.Schema<FormValues[key]> }
  );
  const formSchema = yup.object().shape(schemaShape);

  let rootError: yup.ValidationError | null = null;
  type ErrorsByField = { [key in keyof FormValues]: yup.ValidationError };
  let errorsByField: ErrorsByField;
  try {
    formSchema.validateSync(values, { abortEarly: false, ...yupOptions });
  } catch (e) {
    rootError = e as yup.ValidationError;
    errorsByField = rootError.inner.reduce(
      (newObj, error) => ({ ...newObj, [error.path]: error }),
      {} as ErrorsByField
    );
  }

  const validatedFields: ValidatedFormFields<FormValues> = fieldKeys.reduce((newObj, key) => {
    const field = fields[key];
    const error = errorsByField ? errorsByField[key] : null;
    const validatedField: IValidatedFormField<FormValues[keyof FormValues]> = {
      ...field,
      error,
      isValid: !error || !field.touched,
    };
    return { ...newObj, [key]: validatedField };
  }, {} as ValidatedFormFields<FormValues>);

  // TODO do we need to worry about debouncing / lag from validating on each keystroke?
  // TODO do we want to memoize?

  return {
    fields: validatedFields,
    values,
    isValid: !rootError,
    reset: () => fieldKeys.forEach((key) => fields[key].reset()),
    schema: formSchema,
  };
};

// PatternFly-specific rendering helpers for FormGroup and TextInput components:

export const getFormGroupProps = <T>(
  field: IValidatedFormField<T>
): Pick<FormGroupProps, 'validated' | 'helperTextInvalid'> => ({
  validated: field.isValid ? 'default' : 'error',
  helperTextInvalid: field.error?.message,
});

export const getTextInputProps = (
  field: IValidatedFormField<string>
): Pick<TextInputProps, 'value' | 'onChange' | 'onBlur' | 'validated'> => ({
  value: field.value,
  onChange: field.setValue,
  onBlur: () => field.setTouched(true),
  validated: field.isValid ? 'default' : 'error',
});
