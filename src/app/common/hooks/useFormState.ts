import * as React from 'react';
import * as yup from 'yup';

import { ProviderType } from '../constants';

interface IFormFieldArgs<T> {
  initialValue: T;
  schema: yup.Schema<T>;
}

interface IFormField<T> {
  value: T;
  setValue: (value: T) => void;
  touched: boolean;
  setTouched: (touched: boolean) => void;
  schema: yup.Schema<T>;
}

interface IValidatedFormField<T> extends IFormField<T> {
  error: yup.ValidationError | null;
  isInvalid: boolean;
}

type FormFields<FormValues> = {
  [key in keyof FormValues]: IFormField<FormValues[key]>;
};

type ValidatedFormFields<FormValues> = {
  [key in keyof FormValues]: IValidatedFormField<FormValues[key]>;
};

interface IFormState<FormValues> {
  fields: ValidatedFormFields<FormValues>;
  values: FormValues; // For convenience in submitting forms (values are also included in fields property)
}

export const useFormField = <T>({ initialValue, schema }: IFormFieldArgs<T>): IFormField<T> => {
  const [value, setValue] = React.useState<T>(initialValue);
  const [touched, setTouched] = React.useState(false);
  return {
    value,
    setValue,
    touched,
    setTouched,
    schema,
  };
};

// FormValues represents an interface of field key to field value type (the T in IFormField<T>).
// It can be inferred from the arguments we pass to useFormState.
export const useFormState = <FormValues>(
  fields: FormFields<FormValues>
): IFormState<FormValues> => {
  const values: FormValues = Object.keys(fields).reduce(
    (newObj, key) => ({ ...newObj, [key]: fields[key].value }),
    {} as FormValues
  );

  const schemaShape = Object.keys(fields).reduce(
    (newObj, key) => ({ ...newObj, [key]: fields[key].schema }),
    {} as { [key: string]: yup.Schema<unknown> }
  );
  const formSchema = yup.object().shape(schemaShape);

  let result: any | null = null;
  let rootError: yup.ValidationError | null = null;
  let errorsByField: { [key: string]: yup.ValidationError } = {};
  try {
    result = formSchema.validateSync(values);
  } catch (e) {
    rootError = e as yup.ValidationError;
    errorsByField = rootError.inner.reduce(
      (newObj, error) => ({ ...newObj, [error.path]: error }),
      {}
    );
  }

  // TODO remove me
  console.log({ result, rootError });

  const validatedFields: ValidatedFormFields<FormValues> = Object.keys(fields).reduce(
    (newObj, key) => {
      const field = fields[key];
      const error = errorsByField[key];
      const validatedField: IValidatedFormField<unknown> = {
        ...field,
        error: error || null,
        isInvalid: field.touched && !!error,
      };
      return { ...newObj, [key]: validatedField };
    },
    {} as ValidatedFormFields<FormValues>
  );

  // TODO do we need to worry about debouncing / lag from validating on each keystroke?
  // TODO do we want to memoize?
  // infer the type of all the values and pass that out as one thing
  return {
    fields: validatedFields,
    values,
  };
};

const TestFn: React.FunctionComponent = () => {
  const form = useFormState({
    providerType: useFormField<ProviderType | null>({
      initialValue: null,
      schema: yup.mixed().oneOf(Object.values(ProviderType)).required(),
    }),
    vmwareName: useFormField<string>({
      initialValue: '',
      schema: yup.string().min(2).max(20).required('A name is min 2 and max 20'),
    }),
  });
  const typeIsInvalid = form.fields.providerType.isInvalid;
  return null;
};
